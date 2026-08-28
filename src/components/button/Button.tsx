import { ColorRing } from 'react-loader-spinner';

interface ButtonProps {
    text: string;
    loading?: boolean;
}

function Button({ text, loading = false }: ButtonProps) {
    return (
        <button
            type="submit"
            disabled={loading}
            className={` w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white transition-all duration-200
                ${loading
                    ? 'bg-gradient-to-r from-[#27ae60] to-[#27ae93] opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#27ae60] to-[#27ae93] hover:brightness-110'}
            `}
            style={{
                boxShadow: '0 4px 12px rgba(255, 106, 0, 0.5)',
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

export default Button;
