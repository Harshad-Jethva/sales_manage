import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RefreshCw, Scissors, Sparkles, Sliders, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

const ImageEditorModal = ({ isOpen, initialImage, onSave, onCancel }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [originalImageSrc, setOriginalImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Adjustments
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);

    const [activeTab, setActiveTab] = useState('crop'); // crop, adjust, ai
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (initialImage) {
            const url = URL.createObjectURL(initialImage);
            setImageSrc(url);
            setOriginalImageSrc(url);
        }
        return () => {
            if (imageSrc) URL.revokeObjectURL(imageSrc);
            if (originalImageSrc) URL.revokeObjectURL(originalImageSrc);
            resetAll();
        };
    }, [initialImage, isOpen]);

    const resetAll = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        if (originalImageSrc) setImageSrc(originalImageSrc);
    };

    const handleBgRemove = async () => {
        if (!imageSrc) return;
        setIsProcessing(true);
        try {
            const blob = await removeBackground(imageSrc);
            const newUrl = URL.createObjectURL(blob);
            setImageSrc(newUrl);
        } catch (err) {
            console.error(err);
            alert("Failed to remove background");
        }
        setIsProcessing(false);
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            // Don't set crossOrigin for blobs or data URLs, it can break them in some browsers
            if (!url.startsWith('blob:') && !url.startsWith('data:')) {
                image.setAttribute('crossOrigin', 'anonymous');
            }
            image.src = url;
        });

    const getRadianAngle = (degreeValue) => {
        return (degreeValue * Math.PI) / 180;
    };

    const handleSave = async () => {
        setIsProcessing(true);
        try {
            const image = await createImage(imageSrc);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const rotRad = getRadianAngle(rotation);
            const bBoxSize = {
                width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
                height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height)
            };

            const cropPx = croppedAreaPixels || { width: bBoxSize.width, height: bBoxSize.height, x: 0, y: 0 };

            // Prevent zero dimensions
            if (cropPx.width <= 0 || cropPx.height <= 0) {
                alert("Crop details invalid");
                setIsProcessing(false);
                return;
            }

            canvas.width = bBoxSize.width;
            canvas.height = bBoxSize.height;

            ctx.translate(bBoxSize.width / 2, bBoxSize.height / 2);
            ctx.rotate(rotRad);
            ctx.translate(-image.width / 2, -image.height / 2);

            // Apply CSS Filters
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

            ctx.drawImage(image, 0, 0);

            // Create a second canvas for the final cropped image
            const croppedCanvas = document.createElement('canvas');
            const croppedCtx = croppedCanvas.getContext('2d');

            croppedCanvas.width = cropPx.width;
            croppedCanvas.height = cropPx.height;

            // Extract the exact cropped area
            croppedCtx.drawImage(
                canvas,
                cropPx.x,
                cropPx.y,
                cropPx.width,
                cropPx.height,
                0,
                0,
                cropPx.width,
                cropPx.height
            );

            croppedCanvas.toBlob((blob) => {
                if (!blob) {
                    alert("Canvas is empty");
                    setIsProcessing(false);
                    return;
                }
                const ext = blob.type === 'image/png' ? 'png' : 'webp';
                const file = new File([blob], `edited_${Date.now()}.${ext}`, { type: blob.type });
                file.isEdited = true;
                onSave(file);
                setIsProcessing(false);
            }, (imageSrc.includes('png') || imageSrc.startsWith('blob:') ? 'image/png' : 'image/webp'), 0.9);
        } catch (e) {
            console.error(e);
            setIsProcessing(false);
            alert("Error processing image");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="editor-modal-root">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="editor-backdrop" onClick={onCancel} />
            <motion.div initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 30, opacity: 0 }} className="editor-content-glass">

                <div className="editor-header bg-darker">
                    <div className="flex-center gap-3">
                        <div className="editor-icon-box bg-purple"><Scissors size={20} /></div>
                        <div><h2 className="editor-title">Studio Editor</h2><p className="text-muted text-sm">Enhance product image</p></div>
                    </div>
                    <button className="editor-close-btn" onClick={onCancel}><X size={20} /></button>
                </div>

                <div className="editor-layout">
                    {/* Toolbar Left */}
                    <div className="editor-sidebar-left bg-dark border-r">
                        <button className={`tool-btn ${activeTab === 'crop' ? 'active' : ''}`} onClick={() => setActiveTab('crop')}>
                            <Scissors size={18} /><span>Crop</span>
                        </button>
                        <button className={`tool-btn ${activeTab === 'adjust' ? 'active' : ''}`} onClick={() => setActiveTab('adjust')}>
                            <Sliders size={18} /><span>Adjust</span>
                        </button>
                        <button className={`tool-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
                            <Sparkles size={18} /><span>AI Tools</span>
                        </button>
                        <div style={{ flexGrow: 1 }} />
                        <button className="tool-btn text-warning" onClick={resetAll}>
                            <RefreshCw size={18} /><span>Reset All</span>
                        </button>
                    </div>

                    {/* Canvas Area */}
                    <div className="editor-workspace">
                        <div className="cropper-container" style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}>
                            {imageSrc && (
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={null}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                />
                            )}
                        </div>
                        {isProcessing && (
                            <div className="processing-overlay">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <RefreshCw size={40} className="text-primary" />
                                </motion.div>
                                <p>Processing Image...</p>
                            </div>
                        )}
                    </div>

                    {/* Properties Right */}
                    <div className="editor-sidebar-right bg-dark border-l">
                        {activeTab === 'crop' && (
                            <div className="prop-panel">
                                <h3>Transform</h3>
                                <div className="prop-group">
                                    <label className="flex-between"><span>Zoom</span><span>{zoom.toFixed(1)}x</span></label>
                                    <div className="flex-center gap-2">
                                        <ZoomOut size={16} className="text-muted" />
                                        <input type="range" className="range-slider" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} />
                                        <ZoomIn size={16} className="text-muted" />
                                    </div>
                                </div>
                                <div className="prop-group">
                                    <label className="flex-between"><span>Rotation</span><span>{rotation}°</span></label>
                                    <div className="flex-center gap-2">
                                        <RotateCcw size={16} className="text-muted" />
                                        <input type="range" className="range-slider" value={rotation} min={0} max={360} onChange={(e) => setRotation(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'adjust' && (
                            <div className="prop-panel">
                                <h3>Color Adjustment</h3>
                                <div className="prop-group">
                                    <label className="flex-between"><span>Brightness</span><span>{brightness}%</span></label>
                                    <input type="range" className="range-slider" value={brightness} min={0} max={200} onChange={(e) => setBrightness(e.target.value)} />
                                </div>
                                <div className="prop-group">
                                    <label className="flex-between"><span>Contrast</span><span>{contrast}%</span></label>
                                    <input type="range" className="range-slider" value={contrast} min={0} max={200} onChange={(e) => setContrast(e.target.value)} />
                                </div>
                                <div className="prop-group">
                                    <label className="flex-between"><span>Saturation</span><span>{saturation}%</span></label>
                                    <input type="range" className="range-slider" value={saturation} min={0} max={200} onChange={(e) => setSaturation(e.target.value)} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="prop-panel">
                                <h3>AI Tools</h3>
                                <div className="ai-card" onClick={handleBgRemove}>
                                    <div className="ai-icon"><ImageIcon size={24} /></div>
                                    <div className="ai-content">
                                        <h4>Remove Background</h4>
                                        <p>Instantly make background transparent</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="editor-footer bg-darker border-t">
                    <button className="btn-secondary-glass" onClick={onCancel}>Cancel</button>
                    <button className="btn-primary-gradient" onClick={handleSave} disabled={isProcessing}>
                        <Check size={18} /> Apply Changes
                    </button>
                </div>
            </motion.div>

            <style>{`
                .editor-modal-root {
                    position: fixed; inset: 0; z-index: 2000;
                    display: flex; align-items: center; justify-content: center;
                }
                .editor-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); }
                .editor-content-glass {
                    position: relative; z-index: 2001;
                    width: 95vw; max-width: 1200px; height: 85vh;
                    background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px; display: flex; flex-direction: column; overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                }
                
                .bg-darker { background: #0b0f19; }
                .bg-dark { background: #1e293b; }
                .border-r { border-right: 1px solid rgba(255,255,255,0.05); }
                .border-l { border-left: 1px solid rgba(255,255,255,0.05); }
                .border-t { border-top: 1px solid rgba(255,255,255,0.05); }

                .editor-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 1rem 1.5rem;
                }
                .editor-icon-box {
                    width: 40px; height: 40px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center; color: white;
                }
                .bg-purple { background: linear-gradient(135deg, #a855f7, #c084fc); }
                .editor-title { margin: 0; font-size: 1.2rem; color: #fff; font-weight: 700; }
                .text-muted { color: #94a3b8; }
                .editor-close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s; }
                .editor-close-btn:hover { color: #fff; transform: scale(1.1); }
                
                .editor-layout { display: flex; flex-grow: 1; min-height: 0; }
                
                .editor-sidebar-left { width: 80px; display: flex; flex-direction: column; padding: 1rem 0.5rem; gap: 0.5rem; }
                .tool-btn {
                    display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
                    background: transparent; border: none; padding: 0.8rem 0.2rem;
                    color: #94a3b8; border-radius: 12px; cursor: pointer; transition: 0.2s;
                }
                .tool-btn span { font-size: 0.7rem; font-weight: 600; }
                .tool-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
                .tool-btn.active { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
                .text-warning { color: #f87171; }
                .text-warning:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

                .editor-workspace {
                    flex-grow: 1; position: relative; background: #000;
                    background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
                .cropper-container { position: absolute; inset: 0; }
                
                .processing-overlay {
                    position: absolute; inset: 0; z-index: 10;
                    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    color: white; gap: 1rem;
                }

                .editor-sidebar-right { width: 300px; padding: 1.5rem; overflow-y: auto; color: #fff; }
                .prop-panel h3 { font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1; margin: 0 0 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
                
                .prop-group { margin-bottom: 1.5rem; }
                .prop-group label { margin-bottom: 0.8rem; font-size: 0.85rem; color: #94a3b8; }
                .flex-between { display: flex; justify-content: space-between; align-items: center; }
                .flex-center { display: flex; align-items: center; }
                .gap-2 { gap: 0.5rem; }
                .gap-3 { gap: 1rem; }

                .range-slider {
                    -webkit-appearance: none; width: 100%; height: 6px; border-radius: 3px;
                    background: rgba(255,255,255,0.1); outline: none; margin: 0.5rem 0;
                }
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
                    background: #a855f7; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                }

                .ai-card {
                    display: flex; gap: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                    padding: 1rem; border-radius: 14px; cursor: pointer; transition: 0.3s; align-items: center;
                }
                .ai-card:hover { background: rgba(168, 85, 247, 0.1); border-color: rgba(168, 85, 247, 0.4); transform: translateY(-2px); }
                .ai-icon { color: #c084fc; }
                .ai-content h4 { margin: 0 0 0.3rem; font-size: 0.95rem; color: #e2e8f0; }
                .ai-content p { margin: 0; font-size: 0.75rem; color: #94a3b8; line-height: 1.4; }

                .editor-footer { display: flex; justify-content: flex-end; padding: 1rem 1.5rem; gap: 1rem; }
                
                .btn-secondary-glass {
                    padding: 0.6rem 1.2rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px; color: #fff; cursor: pointer; font-weight: 600; transition: 0.2s;
                }
                .btn-secondary-glass:hover { background: rgba(255,255,255,0.1); }
                
                .btn-primary-gradient {
                    display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.5rem;
                    background: linear-gradient(135deg, #a855f7, #9333ea); border: none;
                    border-radius: 8px; color: #fff; cursor: pointer; font-weight: 600; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3); transition: 0.2s;
                }
                .btn-primary-gradient:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default ImageEditorModal;
