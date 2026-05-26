import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

export function usePostEngagement(post: { id: string, authorId: string }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<any[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [isSaved, setIsSaved] = useState(false)

  const fetchEngagement = async () => {
    try {
      const res = await apiFetch(`/posts/engagement/${post.id}`)
      if (res.ok) {
        const data = await res.json()
        setLikeCount(data.likeCount)
        setCommentCount(data.commentCount)
        setLiked(data.liked)
        setIsSaved(data.saved)
      }
      
      const commentsRes = await apiFetch(`/posts/${post.id}/comments`)
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        // We need author details for comments, but for now we'll just set it
        // A full implementation would fetch user details for each comment
        setComments(commentsData)
      }
    } catch (e) {
      console.error("Failed to fetch engagement", e)
    }
  }

  useEffect(() => {
    fetchEngagement()
  }, [post.id])

  const toggleLike = async () => {
    try {
      const newLiked = !liked
      setLiked(newLiked)
      setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
      
      const method = newLiked ? 'POST' : 'DELETE'
      await apiFetch(`/posts/like/${post.id}`, { method })
    } catch (e) {
      // Revert on error
      setLiked(!liked)
      setLikeCount(prev => !liked ? prev + 1 : prev - 1)
    }
  }

  const addComment = async (text: string) => {
    try {
      const res = await apiFetch(`/posts/comment/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (res.ok) {
        const newComment = await res.json()
        setComments(prev => [...prev, newComment])
        setCommentCount(prev => prev + 1)
      }
    } catch (e) {
      console.error("Failed to add comment", e)
    }
  }

  const toggleSave = async () => {
    try {
      const newSaved = !isSaved
      setIsSaved(newSaved)
      
      const method = newSaved ? 'POST' : 'DELETE'
      await apiFetch(`/posts/save/${post.id}`, { method })
    } catch (e) {
      setIsSaved(!isSaved)
    }
  }

  return {
    liked,
    likeCount,
    comments,
    commentCount,
    toggleLike,
    addComment,
    isSaved,
    toggleSave
  }
}
