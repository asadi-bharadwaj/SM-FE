import { Avatar } from "../common/Avatar";
import { ProfileStats } from "./ProfileStats";
import { ProfileActions } from "./ProfileActions";
import type { PublicProfile } from "../../types";
import styles from "./ProfileHeader.module.css";

type Props = {
  user: PublicProfile;
  postCount: number;
  isMe: boolean;
  isSubscribed: boolean;
  onSubscribe: () => void;
  onMessage?: () => void;
};

export function ProfileHeader({
  user,
  postCount,
  isMe,
  isSubscribed,
  onSubscribe,
  onMessage,
}: Props) {
  return (
    <div className={styles.row}>
      <Avatar
        src={user.avatarUrl}
        alt=""
        size="xl"
        className={styles.ava}
      />

      <div className={styles.right}>
        <div className={styles.handleRow}>
          <h2 className={styles.h2}>
            @{user.username}
          </h2>
        </div>

        <ProfileStats
          profileUserId={user.id}
          postCount={postCount}
          subscriberCount={
            user.subscriberCount || 0
          }
          followingCount={
            user.followingCount || 0
          }
        />

        <ProfileActions
          isMe={isMe}
          isSubscribed={isSubscribed}
          onSubscribe={onSubscribe}
          onMessage={onMessage}
        />
      </div>
    </div>
  );
}