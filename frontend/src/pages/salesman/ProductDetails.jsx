import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    Package,
    Tag,
    Layers,
    ShieldCheck,
    BarChart2,
    Info,
    ArrowLeft,
    ShoppingCart,
    AlertCircle
} from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: '50%', y: '50%' });
    const [isHovered, setIsHovered] = useState(false);
    const [modalZoomPos, setModalZoomPos] = useState({ x: '50%', y: '50%' });
    const [isModalHovered, setIsModalHovered] = useState(false);

    const handleMouseMove = (e, setPos) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setPos({ x: `${x}%`, y: `${y}%` });
    };

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`http://localhost/sales_manage/backend/api/salesman/products.php?id=${id}`);
            if (response.data.success) {
                setProduct(response.data.data);
            } else {
                setError(response.data.message || 'Product not found.');
            }
        } catch (err) {
            console.error("Error fetching product details:", err);
            if (err.response && err.response.status === 404) {
                setError('Product not found.');
            } else {
                setError('Failed to fetch product details.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="text-rose-500" size={48} />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">404 - Product Not Found</h2>
                <p className="text-gray-400 mb-8 max-w-md">{error || 'The product you are looking for does not exist or has been removed.'}</p>
                <button
                    onClick={() => navigate('/salesman/products')}
                    className="py-3 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={18} /> Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="product-details p-4 lg:p-8">
            <Helmet>
                <title>{product.name} | HAB CREATION</title>
            </Helmet>

            <button
                onClick={() => navigate('/salesman/products')}
                className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} /> Back to Catalog
            </button>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-12 bg-white/5 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10">
                        <div
                            className="w-72 h-72 lg:w-96 lg:h-96 rounded-[3rem] bg-indigo-50/5 flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-600/30 overflow-hidden cursor-crosshair relative group"
                            onClick={() => product.image_path && setIsImageOpen(true)}
                            onMouseMove={(e) => handleMouseMove(e, setZoomPos)}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {product.image_path ? (
                                <img
                                    src={`http://localhost/sales_manage/backend/${product.image_path}`}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4 transition-transform duration-[400ms] pointer-events-none drop-shadow-xl"
                                    style={{
                                        transformOrigin: `${zoomPos.x} ${zoomPos.y}`,
                                        transform: isHovered ? 'scale(2.5)' : 'scale(1)'
                                    }}
                                />
                            ) : (
                                <Package size={100} className="text-indigo-400" />
                            )}

                            {/* Inner ring overlay */}
                            <div className="absolute inset-0 border-2 border-white/10 rounded-[3rem] pointer-events-none"></div>
                        </div>
                        <h2 className="text-4xl font-black text-center text-white leading-tight mb-4">{product.name}</h2>
                        <div className="flex gap-4">
                            <span className="px-6 py-2 rounded-full bg-white/10 text-indigo-400 font-bold border border-white/10">{product.sku}</span>
                            <span className="px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">{product.category}</span>
                        </div>
                    </div>

                    <div className="p-12 space-y-8">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Detailed Statistics</p>
                            <h3 className="text-2xl font-bold text-white">Product Overview</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                                <div className="text-indigo-400 mb-2"><Layers size={20} /></div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Available Stock</p>
                                <p className="text-2xl font-black text-white">{product.stock_quantity} <span className="text-sm font-medium text-gray-500">Units</span></p>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                                <div className="text-emerald-400 mb-2"><Tag size={20} /></div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Sale Price</p>
                                <p className="text-2xl font-black text-white">₹{product.sale_price}</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                                <div className="text-amber-400 mb-2"><ShieldCheck size={20} /></div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">GST Applied</p>
                                <p className="text-2xl font-black text-white">{product.gst_percent}%</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                                <div className="text-purple-400 mb-2"><BarChart2 size={20} /></div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">MRP</p>
                                <p className="text-2xl font-black text-white">₹{product.mrp || 'N/A'}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                <Info size={18} className="text-indigo-400" /> Description
                            </h4>
                            <p className="text-gray-400 leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/10">
                                {product.description || 'No detailed description available for this product. Premium quality assurance guaranteed by HAB CREATION inventory system.'}
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => navigate('/salesman/place-order')}
                                className="flex-1 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <ShoppingCart size={24} /> Add to Order
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Image Modal */}
            <AnimatePresence>
                {isImageOpen && product.image_path && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 lg:p-12 cursor-zoom-out"
                        onClick={() => setIsImageOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative max-w-[90vw] lg:max-w-6xl w-full max-h-[90vh] flex items-center justify-center bg-white/5 rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-crosshair"
                            onClick={(e) => e.stopPropagation()}
                            onMouseMove={(e) => handleMouseMove(e, setModalZoomPos)}
                            onMouseEnter={() => setIsModalHovered(true)}
                            onMouseLeave={() => setIsModalHovered(false)}
                        >
                            <button
                                className="absolute z-10 top-6 right-6 p-3 bg-black/50 hover:bg-rose-500/80 rounded-full text-white backdrop-blur-lg border border-white/20 transition-all font-bold shadow-xl active:scale-95 flex items-center gap-2 group"
                                onClick={() => setIsImageOpen(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                <span className="hidden sm:block text-sm pr-2">Close</span>
                            </button>

                            <div className="w-full h-full min-h-[60vh] max-h-[90vh] flex items-center justify-center p-8 bg-black/20">
                                <img
                                    src={`http://localhost/sales_manage/backend/${product.image_path}`}
                                    alt={product.name}
                                    className="max-w-full max-h-[80vh] w-auto h-auto object-contain pointer-events-none transition-transform duration-[400ms] drop-shadow-2xl"
                                    style={{
                                        transformOrigin: `${modalZoomPos.x} ${modalZoomPos.y}`,
                                        transform: isModalHovered ? 'scale(2.5)' : 'scale(1)'
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetails;
