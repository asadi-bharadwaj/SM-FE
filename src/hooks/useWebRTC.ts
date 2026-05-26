import { useEffect, useRef, useState, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { apiFetch } from '../lib/api';

export type CallStatus = 'IDLE' | 'DIALING' | 'RINGING' | 'CONNECTING' | 'CONNECTED' | 'ENDED';
export type CallType = 'AUDIO' | 'VIDEO';

export function useWebRTC(_userId: string, recipientId: string | null) {
  const [status, setStatus] = useState<CallStatus>('IDLE');
  const [callType, setCallType] = useState<CallType>('AUDIO');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [incomingOffer, setIncomingOffer] = useState<any>(null);
  const [currentRecipientId, setCurrentRecipientId] = useState<string | null>(recipientId);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const callStartTime = useRef<number | null>(null);
  const iceCandidateQueue = useRef<any[]>([]);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const isEnding = useRef(false);
  const { sendCallSignal } = useChatStore();

  const endCall = useCallback(async (sendSignal = true) => {
    if (isEnding.current) return;
    isEnding.current = true;

    const rid = currentRecipientId || recipientId;

    // Calculate duration
    let duration = 0;
    if (callStartTime.current) {
      duration = Math.floor((Date.now() - callStartTime.current) / 1000);
    }

    // Log the call
    if (status !== 'IDLE' && status !== 'ENDED' && rid) {
      const logStatus = status === 'CONNECTED' ? 'COMPLETED' : 'MISSED';
      apiFetch('/chat/calls/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerId: status === 'DIALING' || status === 'CONNECTING' || (status === 'CONNECTED' && callStartTime.current) ? _userId : rid,
          receiverId: status === 'DIALING' || status === 'CONNECTING' || (status === 'CONNECTED' && callStartTime.current) ? rid : _userId,
          type: callType,
          status: logStatus,
          duration: duration,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error("Failed to log call", err));
    }

    if (peerConnection.current) {
      peerConnection.current.onicecandidate = null;
      peerConnection.current.ontrack = null;
      peerConnection.current.oniceconnectionstatechange = null;
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    setRemoteStream(null);
    setIncomingOffer(null);
    setIsMuted(false);
    setIsVideoOff(false);
    callStartTime.current = null;
    setStatus('ENDED');

    if (sendSignal && rid) {
      sendCallSignal(rid, { type: 'HANGUP' });
    }

    setTimeout(() => {
      setStatus('IDLE');
      setCallType('AUDIO');
      isEnding.current = false;
      if (!recipientId) setCurrentRecipientId(null);
    }, 2000);
  }, [localStream, recipientId, currentRecipientId, sendCallSignal, status, callType, _userId]);

  const createPeerConnection = useCallback((rid: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && !isEnding.current) {
        sendCallSignal(rid, { type: 'ICE_CANDIDATE', candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (isEnding.current) return;
      setRemoteStream(event.streams[0]);
      setStatus('CONNECTED');
      callStartTime.current = Date.now();
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
        endCall(true);
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [sendCallSignal, endCall]);

  const startCall = async (type: CallType = 'AUDIO', targetRid?: string) => {
    const rid = targetRid || recipientId;
    if (!rid) return;

    isEnding.current = false;
    setCallType(type);
    setIsVideoOff(type === 'AUDIO');
    setStatus('DIALING');
    setCurrentRecipientId(rid);

    try {
      const constraints = { audio: true, video: type === 'VIDEO' };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      const pc = createPeerConnection(rid);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      sendCallSignal(rid, { type: 'OFFER', offer, callType: type });
    } catch (err) {
      console.error("Failed to start call", err);
      setStatus('IDLE');
    }
  };

  const acceptCall = async (offer: any, type: CallType = 'AUDIO') => {
    const rid = currentRecipientId;
    if (!rid) return;

    isEnding.current = false;
    setCallType(type);
    setIsVideoOff(type === 'AUDIO');
    setStatus('CONNECTING');
    setIncomingOffer(null);
    try {
      const constraints = { audio: true, video: type === 'VIDEO' };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      const pc = createPeerConnection(rid);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.warn(e));
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendCallSignal(rid, { type: 'ANSWER', answer });
    } catch (err) {
      console.error("Failed to accept call", err);
      endCall();
    }
  };

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, [localStream]);

  useEffect(() => {
    const handleSignal = (signal: any) => {
      // If we have a fixed recipientId (e.g. in ChatThread), only listen to them
      // If no fixed recipientId (global), listen to whoever sent the offer
      if (recipientId && signal.senderId !== recipientId) return;

      switch (signal.type) {
        case 'OFFER':
          if (status === 'IDLE' || status === 'ENDED') {
            setIncomingOffer(signal.offer);
            setCallType(signal.callType || 'AUDIO');
            setStatus('RINGING');
            setCurrentRecipientId(signal.senderId);
          }
          break;
        case 'ANSWER':
          if (peerConnection.current && signal.senderId === currentRecipientId) {
            peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal.answer))
              .catch(err => console.error("Error setting remote description", err));
          }
          break;
        case 'ICE_CANDIDATE':
          if (signal.senderId === currentRecipientId) {
            if (peerConnection.current && peerConnection.current.remoteDescription) {
              if (signal.candidate) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(signal.candidate))
                  .catch(err => console.warn("Error adding ICE candidate", err));
              }
            } else {
              if (signal.candidate) {
                iceCandidateQueue.current.push(signal.candidate);
              }
            }
          }
          break;
        case 'HANGUP':
          if (signal.senderId === currentRecipientId) {
            endCall(false);
          }
          break;
      }
    };

    useChatStore.setState({ onCallSignal: handleSignal });
    return () => {
      const current = useChatStore.getState().onCallSignal;
      if (current === handleSignal) {
        useChatStore.setState({ onCallSignal: undefined });
      }
    };
  }, [recipientId, endCall, status, currentRecipientId]);

  return {
    status,
    callType,
    isMuted,
    isVideoOff,
    toggleAudio,
    toggleVideo,
    startCall,
    acceptCall,
    endCall,
    remoteStream,
    localStream,
    incomingOffer,
    recipientId: currentRecipientId
  };
}
