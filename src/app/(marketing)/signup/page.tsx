'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCheckEmail,
  useSendVerification,
  useVerifyCode,
  useSubmitBusinessDetails,
  useCompleteRegistration,
} from '@/features/auth/onboarding-api';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Building2,
  CheckCircle,
  Clock,
  Globe,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  Sparkles,
  User,
  Users,
  Wifi,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    verification_code: '',
    business_name: '',
    business_type: 'HOTSPOT' as 'HOTSPOT' | 'PPPOE' | 'HYBRID',
    phone: '',
    country: 'Kenya',
    city: '',
    admin_first_name: '',
    admin_last_name: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const checkEmail = useCheckEmail();
  const sendVerification = useSendVerification();
  const verifyCode = useVerifyCode();
  const submitBusiness = useSubmitBusinessDetails();
  const completeRegistration = useCompleteRegistration();

  const isPending =
    checkEmail.isPending ||
    sendVerification.isPending ||
    verifyCode.isPending ||
    submitBusiness.isPending ||
    completeRegistration.isPending;

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid business email address';
      }
    }

    if (step === 2) {
      if (!formData.verification_code || formData.verification_code.length !== 6) {
        newErrors.verification_code = 'Please enter the 6-digit verification code';
      }
    }

    if (step === 3) {
      if (!formData.business_name) newErrors.business_name = 'Business name is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    }

    if (step === 4) {
      if (!formData.admin_first_name) newErrors.admin_first_name = 'First name is required';
      if (!formData.admin_last_name) newErrors.admin_last_name = 'Last name is required';
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailStep = async () => {
    if (!validateStep(1)) return;

    try {
      // Check email availability
      const result = await checkEmail.mutateAsync({ email: formData.email });
      if (!result.available) {
        setErrors({ email: result.message });
        return;
      }
      setEmailAvailable(true);

      // Send verification code
      const verifyResult = await sendVerification.mutateAsync({ email: formData.email });
      setVerificationSent(true);

      // In dev mode, extract the code from the message
      const codeMatch = verifyResult.message.match(/\[DEV: (\d{6})\]/);
      if (codeMatch) {
        setDevCode(codeMatch[1]);
      }

      setCurrentStep(2);
    } catch (error: any) {
      setErrors({ email: error?.message || 'Failed to check email' });
    }
  };

  const handleVerifyStep = async () => {
    if (!validateStep(2)) return;

    try {
      await verifyCode.mutateAsync({
        email: formData.email,
        verification_code: formData.verification_code,
      });
      setCurrentStep(3);
    } catch (error: any) {
      setErrors({ verification_code: error?.message || 'Invalid verification code' });
    }
  };

  const handleBusinessStep = async () => {
    if (!validateStep(3)) return;

    try {
      await submitBusiness.mutateAsync({
        email: formData.email,
        business_name: formData.business_name,
        business_type: formData.business_type,
        phone: formData.phone,
        country: formData.country,
        city: formData.city || undefined,
      });
      setCurrentStep(4);
    } catch (error: any) {
      setErrors({ business_name: error?.message || 'Failed to save business details' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    try {
      const result = await completeRegistration.mutateAsync({
        email: formData.email,
        admin_first_name: formData.admin_first_name,
        admin_last_name: formData.admin_last_name,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      // Store the access token and redirect to dashboard
      if (result.access_token) {
        localStorage.setItem('auth-token', result.access_token);
      }
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ password: error?.message || 'Registration failed' });
    }
  };

  const handleNext = () => {
    if (currentStep === 1) handleEmailStep();
    else if (currentStep === 2) handleVerifyStep();
    else if (currentStep === 3) handleBusinessStep();
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    { id: 1, title: 'Email', icon: Mail },
    { id: 2, title: 'Verify', icon: KeyRound },
    { id: 3, title: 'Business', icon: Building2 },
    { id: 4, title: 'Security', icon: Shield },
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Streamlined ISP Management',
      description:
        'Manage your entire ISP operation from a single dashboard. Monitor performance, handle billing, and track customer usage effortlessly.',
    },
    {
      icon: Users,
      title: 'Customer-First Approach',
      description:
        'Provide exceptional service with our integrated customer management system. Handle support tickets and manage subscriptions seamlessly.',
    },
    {
      icon: Plus,
      title: 'Automated Billing',
      description:
        'Save time with automated billing cycles, payment processing, and invoice generation. Keep your revenue flowing smoothly.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 dark:bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)],
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Left Column - Marketing Content */}
        <motion.div
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-900 to-gray-400 p-12 flex-col justify-center relative overflow-hidden"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            }}
          ></div>

          <div className="relative z-10">
            {/* Logo */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Image
                src="/images/logo/logo.png"
                alt="CodeVertex Billing"
                width={180}
                height={60}
                className="h-14 w-auto mb-8"
              />
            </motion.div>

            {/* Main Heading */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </motion.div>
                <span className="text-white/90 font-medium">Join 500+ ISPs</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Manage Your ISP Business with Ease
                <motion.div
                  className="w-20 h-1 bg-white mt-3"
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                ></motion.div>
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                Streamline operations, automate billing, and delight your customers with our all-in-one platform.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-white/80 leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Signup Form */}
        <motion.div
          className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full max-w-md">
            {/* Form Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h2>
              <p className="text-gray-600 dark:text-gray-300">Start your 14-day free trial today</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card className="p-6 sm:p-8 shadow-2xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {/* 14-day free trial badge */}
                <motion.div
                  className="flex justify-end mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
                >
                  <div className="flex items-center gap-2 bg-gradient-to-r from-brand-700 to-gray-400 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    <Clock className="h-4 w-4" />
                    14-day free trial
                  </div>
                </motion.div>

                {/* Progress Stepper */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                      <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <motion.div
                            className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
                              currentStep >= step.id
                                ? 'bg-gradient-to-r from-brand-700 to-gray-400 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            animate={{
                              scale: currentStep === step.id ? [1, 1.1, 1] : 1,
                            }}
                            transition={{
                              scale: { duration: 0.5, repeat: currentStep === step.id ? Infinity : 0, repeatDelay: 1 },
                            }}
                          >
                            {currentStep > step.id ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <step.icon className="h-5 w-5" />
                            )}
                          </motion.div>
                          <span
                            className={`mt-2 text-xs font-medium hidden sm:block ${
                              currentStep >= step.id
                                ? 'text-primary'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <motion.div
                            className={`h-1 flex-1 mx-2 rounded transition-all duration-500 ${
                              currentStep > step.id
                                ? 'bg-gradient-to-r from-brand-700 to-gray-400'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.3 * index }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Email */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Business Email*
                        </Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={isPending}
                            className={`pl-11 h-12 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          We&apos;ll send a verification code to this email.
                        </p>
                        {errors.email && (
                          <motion.p
                            className="text-red-500 text-sm mt-2"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </motion.div>
                    )}

                    {/* Step 2: Email Verification */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        className="space-y-4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Mail className="h-8 w-8 text-primary" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            We sent a 6-digit code to <strong>{formData.email}</strong>
                          </p>
                          {devCode && (
                            <p className="text-xs text-amber-600 mt-1 font-mono bg-amber-50 dark:bg-amber-900/20 rounded px-2 py-1 inline-block">
                              Dev code: {devCode}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="verification_code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Verification Code*
                          </Label>
                          <div className="relative mt-2">
                            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="verification_code"
                              type="text"
                              maxLength={6}
                              placeholder="000000"
                              value={formData.verification_code}
                              onChange={(e) =>
                                setFormData({ ...formData, verification_code: e.target.value.replace(/\D/g, '').slice(0, 6) })
                              }
                              disabled={isPending}
                              className={`pl-11 h-12 text-center text-2xl tracking-[0.5em] font-mono ${
                                errors.verification_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                              }`}
                            />
                          </div>
                          {errors.verification_code && (
                            <motion.p
                              className="text-red-500 text-sm mt-2"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              {errors.verification_code}
                            </motion.p>
                          )}
                          <button
                            type="button"
                            onClick={() => sendVerification.mutate({ email: formData.email })}
                            className="text-sm text-primary hover:text-brand-900 mt-2"
                            disabled={sendVerification.isPending}
                          >
                            {sendVerification.isPending ? 'Sending...' : 'Resend code'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Business Details */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        className="space-y-4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>
                          <Label htmlFor="business_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Business Name*
                          </Label>
                          <div className="relative mt-2">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="business_name"
                              type="text"
                              placeholder="Your ISP Company"
                              value={formData.business_name}
                              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                              disabled={isPending}
                              className={`pl-11 h-12 ${errors.business_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            />
                          </div>
                          {errors.business_name && (
                            <motion.p className="text-red-500 text-sm mt-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                              {errors.business_name}
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Type*</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {[
                              { value: 'HOTSPOT', label: 'Hotspot', icon: Wifi },
                              { value: 'PPPOE', label: 'PPPoE', icon: Globe },
                              { value: 'HYBRID', label: 'Hybrid', icon: Users },
                            ].map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, business_type: type.value as any })}
                                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                                  formData.business_type === type.value
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300'
                                }`}
                              >
                                <type.icon className="h-5 w-5" />
                                <span className="text-xs font-medium">{type.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number*
                          </Label>
                          <div className="relative mt-2">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+254700000000"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              disabled={isPending}
                              className={`pl-11 h-12 ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            />
                          </div>
                          {errors.phone && (
                            <motion.p className="text-red-500 text-sm mt-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                              {errors.phone}
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            City (Optional)
                          </Label>
                          <div className="relative mt-2">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="city"
                              type="text"
                              placeholder="Nairobi"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              disabled={isPending}
                              className="pl-11 h-12 border-gray-300 dark:border-gray-600"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Security */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step4"
                        className="space-y-4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="admin_first_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              First Name*
                            </Label>
                            <div className="relative mt-2">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                id="admin_first_name"
                                type="text"
                                placeholder="John"
                                value={formData.admin_first_name}
                                onChange={(e) => setFormData({ ...formData, admin_first_name: e.target.value })}
                                disabled={isPending}
                                className={`pl-11 h-12 ${errors.admin_first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                              />
                            </div>
                            {errors.admin_first_name && (
                              <motion.p className="text-red-500 text-sm mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {errors.admin_first_name}
                              </motion.p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="admin_last_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Last Name*
                            </Label>
                            <div className="relative mt-2">
                              <Input
                                id="admin_last_name"
                                type="text"
                                placeholder="Doe"
                                value={formData.admin_last_name}
                                onChange={(e) => setFormData({ ...formData, admin_last_name: e.target.value })}
                                disabled={isPending}
                                className={`h-12 ${errors.admin_last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                              />
                            </div>
                            {errors.admin_last_name && (
                              <motion.p className="text-red-500 text-sm mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {errors.admin_last_name}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password*
                          </Label>
                          <div className="relative mt-2">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="password"
                              type="password"
                              placeholder="Create a strong password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              disabled={isPending}
                              className={`pl-11 h-12 ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            />
                          </div>
                          {errors.password && (
                            <motion.p className="text-red-500 text-sm mt-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                              {errors.password}
                            </motion.p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 8 characters long</p>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirm Password*
                          </Label>
                          <div className="relative mt-2">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              disabled={isPending}
                              className={`pl-11 h-12 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            />
                          </div>
                          {errors.confirmPassword && (
                            <motion.p className="text-red-500 text-sm mt-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                              {errors.confirmPassword}
                            </motion.p>
                          )}
                        </div>

                        <div className="flex items-start">
                          <input
                            id="agreeToTerms"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                            checked={formData.agreeToTerms}
                            onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                            disabled={isPending}
                          />
                          <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="text-primary hover:text-brand-900 font-medium">
                              Terms & Conditions
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-primary hover:text-brand-900 font-medium">
                              Privacy Policy
                            </Link>
                          </label>
                        </div>
                        {errors.agreeToTerms && (
                          <motion.p className="text-red-500 text-sm" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                            {errors.agreeToTerms}
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-4">
                    {currentStep > 1 && (
                      <motion.div className="flex-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={isPending}
                          className="w-full h-12 border-gray-300 dark:border-gray-600"
                        >
                          Previous
                        </Button>
                      </motion.div>
                    )}

                    {currentStep < 4 ? (
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={isPending}
                          className="w-full h-12 bg-gradient-to-r from-brand-700 to-gray-400 hover:from-brand-900 hover:to-brand-700 text-white"
                        >
                          {isPending ? (
                            <span className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                              Processing...
                            </span>
                          ) : (
                            'Continue'
                          )}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isPending}
                          className="w-full h-12 bg-gradient-to-r from-brand-700 to-gray-400 hover:from-brand-900 hover:to-brand-700 text-white"
                        >
                          {isPending ? (
                            <span className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                              Creating account...
                            </span>
                          ) : (
                            'Create Account'
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </form>

                <motion.div
                  className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <p>
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary hover:text-brand-900">
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              </Card>

              {/* Security Badge */}
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Protected by enterprise-grade security</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
