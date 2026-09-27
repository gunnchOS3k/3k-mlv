import type { MlvVisibility } from '@3k-mlv/shared';

const LABEL: Record<MlvVisibility, string> = {
  private: 'Private',
  shared: 'Shared (unlisted)',
  public: 'Public',
};

export default function PrivacyBadge({ visibility }: { visibility: MlvVisibility }) {
  return (
    <span
      className={`mlv-privacy-badge mlv-privacy-badge--${visibility}`}
      aria-label={`Visibility: ${LABEL[visibility]}`}
    >
      {LABEL[visibility]}
    </span>
  );
}
