import { FC } from 'react';

const CodeDisplay: FC<{ text: string }> = ({ text }) => {
    const renderChar = (char: string) => {
        if (/\d/.test(char)) {
            return <span style={{ color: 'mistyrose' }}>{char}</span>;
        } else if (/[a-z]/.test(char)) {
            return <span style={{ color: 'white' }}>{char}</span>;
        } else if (/[A-Z]/.test(char)) {
            return <span style={{ color: 'thistle', fontWeight: 'bold' }}>{char}</span>;
        } else {
            return char;
        }
    };

    return (
        <span style={{ fontFamily: 'Cutive Mono' }}>
            {text.split('').map((char, index) => (
                <span key={index}>{renderChar(char)}</span>
            ))}
        </span>
    );
};

export default CodeDisplay;