import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface BackButtonProps {
  href: string;
  label?: string;
}

export default function BackButton({ href, label = 'Back to Server Settings' }: BackButtonProps) {
  return (
    <div className="mb-6">
      <Link href={href} className="text-slate-400 hover:text-white inline-flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
        {label}
      </Link>
    </div>
  );
}
