import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/common/SEO';
import LoginAnimation from '../components/LoginAnimation';
import gsap from 'gsap';
import { buildApiUrl } from '../config/api';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [animationStatus, setAnimationStatus] = useState('idle'); // 'idle', 'success', 'failure'
    const [pendingLoginData, setPendingLoginData] = useState(null);

    const formRef = useRef(null);
    const logoRef = useRef(null);
    const welcomeRef = useRef(null);
    const brandRef = useRef(null);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (user && animationStatus !== 'success') {
            handleRedirect(user);
        }
    }, [user]);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

        tl.fromTo(logoRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' })
            .fromTo(welcomeRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1 }, "-=0.4")
            .fromTo(brandRef.current, { x: -30, opacity: 0 }, { x: 0, opacity: 1 }, "-=0.6")
            .fromTo(inputRefs.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1 }, "-=0.6")
            .fromTo('.login-btn', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }, "-=0.4")
            .fromTo('.signup-text', { opacity: 0 }, { opacity: 1 }, "-=0.4");
    }, []);

    const handleRedirect = (userData) => {
        if (userData.role === 'cashier') navigate('/pos', { replace: true });
        else if (userData.role === 'salesman') navigate('/salesman/dashboard', { replace: true });
        else if (userData.role === 'warehouse') navigate('/warehouse/dashboard', { replace: true });
        else if (userData.role === 'admin') navigate('/admin/dashboard', { replace: true });
        else if (userData.role === 'delivery') navigate('/delivery/dashboard', { replace: true });
        else if (['client_panel', 'vendor_user', 'salesman_user'].includes(userData.role)) navigate('/', { replace: true });
        else navigate('/', { replace: true });
    };

    const onAnimationComplete = () => {
        if (animationStatus === 'success' && pendingLoginData) {
            login(pendingLoginData.user, pendingLoginData.token);
            handleRedirect(pendingLoginData.user);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setAnimationStatus('idle');

        try {
            const res = await axios.post(buildApiUrl('login.php'), formData);
            if (res.data.success) {
                setPendingLoginData({ user: res.data.user, token: res.data.token });
                setAnimationStatus('success');
                // No immediate redirect, wait for animation
            } else {
                setError(res.data.message || 'Login failed.');
                setAnimationStatus('failure');
                setTimeout(() => setAnimationStatus('idle'), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setAnimationStatus('failure');
            setTimeout(() => setAnimationStatus('idle'), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <SEO title="Login | HAB ERP" description="Login to your ERP dashboard" />

            <div className="login-form-side" ref={formRef}>
                <div className="login-logo-circle" ref={logoRef}></div>

                <h3 className="welcome-text" ref={welcomeRef}>Welcome to</h3>
                <h1 className="brand-text" ref={brandRef}>HAB CREATION</h1>

                {error && (
                    <div className="error-message mb-6 text-red-500 text-sm font-medium animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group" ref={el => inputRefs.current[0] = el}>
                        <label className="input-label">Email</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="bonjourguys@talk.com"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group" ref={el => inputRefs.current[1] = el}>
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'CHECKING...' : 'LOGIN'}
                    </button>
                </form>

                <p className="signup-text">
                    Dont have an account? <Link to="#" className="signup-link">Sign up</Link>
                </p>

                <svg className="wavy-divider" viewBox="0 0 100 1000" preserveAspectRatio="none">
                    <path d="M0 0 L 0 1000 L 20 1000 Q 80 750 20 500 T 20 0 Z" />
                </svg>
            </div>

            <div className="login-animation-side">
                <LoginAnimation status={animationStatus} onAnimationComplete={onAnimationComplete} />
            </div>
        </div>
    );
};


export default Login;
