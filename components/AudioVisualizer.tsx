import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
    analyserNode: AnalyserNode | null;
    isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyserNode, isPlaying }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    useEffect(() => {
        if (analyserNode) {
            dataArrayRef.current = new Uint8Array(analyserNode.frequencyBinCount);
        }
    }, [analyserNode]);


    // Effect for handling the animation loop based on the isPlaying state.
    useEffect(() => {
        const draw = () => {
            if (!analyserNode || !dataArrayRef.current || !canvasRef.current) {
                return;
            }
            
            const dataArray = dataArrayRef.current;
            const canvas = canvasRef.current;
            const canvasCtx = canvas.getContext('2d');
            
            if (!canvasCtx) return;

            animationFrameIdRef.current = requestAnimationFrame(draw);
            analyserNode.getByteFrequencyData(dataArray);

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            const bufferLength = analyserNode.frequencyBinCount;
            const barWidth = (canvas.width / bufferLength) * 1.5;
            let x = 0;
            const height = canvas.height;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height * 0.9;
                
                if (barHeight > 0) {
                  const gradient = canvasCtx.createLinearGradient(0, height, 0, height - barHeight);
                  gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
                  gradient.addColorStop(0.6, 'rgba(0, 255, 255, 0.5)');
                  gradient.addColorStop(1, 'rgba(224, 118, 255, 0.7)');
  
                  canvasCtx.fillStyle = gradient;
                  canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);
                }

                x += barWidth + 2;
            }
        };

        if (isPlaying && analyserNode) {
            if (!animationFrameIdRef.current) {
                draw();
            }
        } else {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
             if (canvasRef.current) {
                const canvasCtx = canvasRef.current.getContext('2d');
                if (canvasCtx) {
                    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
            }
        }
        
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
        };
    }, [isPlaying, analyserNode]);

    return <canvas ref={canvasRef} width="300" height="32" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-full opacity-60" />;
};

export default AudioVisualizer;