import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchPostEngagement,
  likePost,
  unlikePost,
  postComment,
  savePost,
  unsavePost,
} from "../api/engagementApi";
import { getCurrentUserId } from "../lib/currentUser";
import type { Comment } from "../types";

type State = {
  loading: boolean;
  error: string | null;
  liked: boolean;
  likeCount: number;
  saved: boolean;
  comments: Comment[];
};

/** Load/sync engagement for one post. Use only inside `PostEngagementProvider`. */
export function usePostEngagementState(postId: string) {
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    liked: false,
    likeCount: 0,
    saved: false,
    comments: [],
  });

  const likedRef = useRef(false);
  const savedRef = useRef(false);
  likedRef.current = state.liked;
  savedRef.current = state.saved;

  const refresh = useCallback(async () => {
    try {
      const data = await fetchPostEngagement(postId);
      setState({
        loading: false,
        error: null,
        liked: data.liked,
        likeCount: data.likeCount,
        saved: data.saved,
        comments: data.comments,
      });
    } catch (e: unknown) {
      setState((s) => ({
        ...s,
        loading: false,
        error:
          e instanceof Error ? e.message : "Could not load likes & comments.",
      }));
    }
  }, [postId]);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchPostEngagement(postId)
      .then((data) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          liked: data.liked,
          likeCount: data.likeCount,
          saved: data.saved,
          comments: data.comments,
        });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          error:
            e instanceof Error ? e.message : "Could not load likes & comments.",
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const toggleLike = useCallback(async () => {
    if (!getCurrentUserId()) return;
    const willUnlike = likedRef.current;
    try {
      if (willUnlike) await unlikePost(postId);
      else await likePost(postId);
      await refresh();
    } catch {
      await refresh();
    }
  }, [postId, refresh]);

  const toggleSave = useCallback(async () => {
    if (!getCurrentUserId()) return;
    const willUnsave = savedRef.current;
    try {
      if (willUnsave) await unsavePost(postId);
      else await savePost(postId);
      await refresh();
    } catch {
      await refresh();
    }
  }, [postId, refresh]);

  const addComment = useCallback(
    async (text: string) => {
      if (!getCurrentUserId()) throw new Error("Not signed in");
      try {
        const c = await postComment(postId, text);
        setState((s) => ({
          ...s,
          comments: [...s.comments, c],
        }));
      } catch {
        await refresh();
        throw new Error("Comment failed");
      }
    },
    [postId, refresh],
  );

  return {
    loading: state.loading,
    error: state.error,
    liked: state.liked,
    likeCount: state.likeCount,
    saved: state.saved,
    comments: state.comments,
    refresh,
    toggleLike,
    toggleSave,
    addComment,
  };
}
