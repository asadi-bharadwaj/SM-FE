import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { ArrowLeft, Shield, Calendar, Users, LogOut, Settings } from 'lucide-react';
import styles from './GroupDetailsPage.module.css';

interface GroupMember {
  id: string | number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

interface GroupDetails {
  id: number;
  threadId: string;
  name: string;
  creatorId: string;
  createdAt: string;
  members: GroupMember[];
}

export function GroupDetailsPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (!threadId) return;

    apiFetch(`/chat/groups/details/${threadId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.name) {
          setDetails(data);
        } else {
          setDetails(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch group details", err);
        setDetails(null);
        setLoading(false);
      });
  }, [threadId]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Loading group details...</span>
      </div>
    );
  }

  if (!details || !details.name) {
    return (
      <div className={styles.error}>
        <h2>Group not found</h2>
        <p>The group might have been deleted or you might not be a member.</p>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Go Back
        </button>
      </div>
    );
  }

  const isAdmin = String(details.creatorId) === String(currentUserId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Group Info</h1>
      </div>

      <div className={styles.hero}>
        <div className={styles.avatar}>
          {(details.name || "??").substring(0, 2).toUpperCase()}
        </div>
        <h2 className={styles.groupName}>{details.name}</h2>
        <div className={styles.groupMeta}>
          Group · {details.members?.length || 0} participants
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.infoRow}>
          <div className={styles.infoIcon}><Calendar size={18} /></div>
          <div className={styles.infoContent}>
            <div className={styles.infoLabel}>Created on</div>
            <div className={styles.infoValue}>
              {details.createdAt ? new Date(details.createdAt).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Unknown date'}
            </div>
          </div>
        </div>
        
        <div className={styles.infoRow}>
          <div className={styles.infoIcon}><Shield size={18} /></div>
          <div className={styles.infoContent}>
            <div className={styles.infoLabel}>Admin</div>
            <div className={styles.infoValue}>
              {details.members?.find(m => String(m.id) === String(details.creatorId))?.displayName || 'Unknown Admin'}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Users size={18} />
          <span>{details.members?.length || 0} Participants</span>
        </div>
        
        <div className={styles.memberList}>
          {details.members?.map((member) => (
            <div key={member.id} className={styles.memberRow} onClick={() => navigate(`/u/${member.username}`)}>
              <div className={styles.memberAvatar}>
                {(member.displayName || member.username || "?").substring(0, 1).toUpperCase()}
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>
                  {member.displayName || member.username || 'Unknown User'}
                  {String(member.id) === String(currentUserId) && <span className={styles.youTag}>You</span>}
                </div>
                <div className={styles.memberUsername}>@{member.username || 'unknown'}</div>
              </div>
              {String(member.id) === String(details.creatorId) && (
                <div className={styles.adminBadge}>Group Admin</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        {isAdmin && (
          <button className={styles.actionBtn}>
            <Settings size={18} />
            <span>Group Settings</span>
          </button>
        )}
        <button className={`${styles.actionBtn} ${styles.danger}`}>
          <LogOut size={18} />
          <span>Exit Group</span>
        </button>
      </div>
    </div>
  );
}
