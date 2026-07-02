import { Avatar } from '../Avatar/Avatar';
import styles from './UserCell.module.css';

export interface UserCellProps {
  name: string;
  email?: string;
}

/** A rich person cell: avatar + name over a muted secondary line (email). */
export function UserCell({ name, email }: UserCellProps) {
  return (
    <div className={styles.cell}>
      <Avatar name={name} size="sm" />
      <div className={styles.text}>
        <span className={styles.name}>{name}</span>
        {email && <span className={styles.email}>{email}</span>}
      </div>
    </div>
  );
}
