import { ColorRing } from 'react-loader-spinner';

interface ButtonProps {
  text: string;
  loading?: boolean;
  onClick?: () => void;
}

function DeleteButton({ text, loading = false, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200
        ${loading
          ? 'bg-gradient-to-r from-[#ff5858] to-[#f857a6] text-white opacity-60 cursor-not-allowed'
          : 'bg-gradient-to-r from-[#ff5858] to-[#f857a6] text-white hover:brightness-110'}
      `}
      style={{
        boxShadow: '0 4px 15px 0 rgba(248, 87, 166, 0.5)',
      }}
    >
      {loading && (
        <ColorRing
          visible={true}
          height={24}
          width={24}
          colors={['#fff', '#fff', '#fff', '#fff', '#fff']}
        />
      )}
      <span>{text}</span>
    </button>
  );
}

export default DeleteButton;
