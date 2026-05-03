import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { usePostEngagementState } from "../hooks/usePostEngagement";

type EngagementApi = ReturnType<typeof usePostEngagementState>;

const PostEngagementContext = createContext<EngagementApi | null>(null);

export function PostEngagementProvider({
  postId,
  children,
}: {
  postId: string;
  children: ReactNode;
}) {
  const value = usePostEngagementState(postId);
  return (
    <PostEngagementContext.Provider value={value}>
      {children}
    </PostEngagementContext.Provider>
  );
}

export function usePostEngagement(): EngagementApi {
  const ctx = useContext(PostEngagementContext);
  if (!ctx) {
    throw new Error(
      "usePostEngagement must be used within PostEngagementProvider",
    );
  }
  return ctx;
}
