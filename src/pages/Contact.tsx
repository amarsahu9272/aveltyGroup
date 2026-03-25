import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  requirement: z.string().min(10, 'Please provide more details about your requirement'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'leads'), {
        ...data,
        status: 'New',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      reset();
    } catch (error) {
      console.error("Error submitting lead:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have a project in mind? Get in touch with our experts for a free consultation and quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Get in Touch</h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Our Office</h3>
                    <p className="text-gray-600">NH-33 RIPIT COLONY MANGO, EAST-SINGHBHUM JHARKHAND, NEAR M.G.M MEDICAL COLLEG PINCODE- 831018</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">06573554267</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">admid@aveltygroup.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Business Hours</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex justify-between"><span>Monday - Friday</span> <span>9:00 AM - 6:00 PM</span></li>
                <li className="flex justify-between"><span>Saturday</span> <span>10:00 AM - 4:00 PM</span></li>
                <li className="flex justify-between"><span>Sunday</span> <span>Closed</span></li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
                <p className="text-gray-600 mb-8">
                  Your inquiry has been submitted successfully. Our team will contact you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      {...register('name')}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all",
                        errors.name ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-blue-100"
                      )}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      {...register('email')}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all",
                        errors.email ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-blue-100"
                      )}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    {...register('phone')}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all",
                      errors.phone ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-blue-100"
                    )}
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Requirements</label>
                  <textarea
                    {...register('requirement')}
                    rows={5}
                    className={cn(
                      "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none",
                      errors.requirement ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-blue-100"
                    )}
                    placeholder="Tell us about your project..."
                  />
                  {errors.requirement && <p className="mt-1 text-xs text-red-500">{errors.requirement.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
