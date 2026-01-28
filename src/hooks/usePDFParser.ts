import { useState } from 'react';
import { parsePDF, ParsedPDF } from '@/lib/pdf-parsing';

interface UsePDFParserProps {
    setData: (data: ParsedPDF) => void;
}

export function usePDFParser({ setData }: UsePDFParserProps) {
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = async (uploadedFile: File) => {
        setIsParsing(true);
        setError(null);
        try {
            const parsed = await parsePDF(uploadedFile);
            setData(parsed);
        } catch (err: any) {
            console.error(err);
            setError("Failed to parse PDF. Ensure it has readable text and highlights.");
        } finally {
            setIsParsing(false);
        }
    };

    const resetError = () => setError(null);

    return {
        isParsing,
        error,
        handleFile,
        resetError
    };
}
