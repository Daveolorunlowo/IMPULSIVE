'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, ShieldCheck, Ruler, FileText, ArrowRight, ChevronRight, HelpCircle } from 'lucide-react';
import { useCurrency } from '@/store/useCurrency';

export default function ClientServicesContent() {
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  
  const validTabs = ['shipping', 'size-guide', 'privacy', 'terms'];
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'shipping';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Interactive Fit Advisor state
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [advisorResult, setAdvisorResult] = useState<string | null>(null);

  // Sync state with URL parameter if it changes
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.replace(`/client-services?tab=${tab}`, { scroll: false });
  };

  const calculateAdvisorSize = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w)) return;
    
    let size = 'M';
    if (w < 60) size = 'XS';
    else if (w < 70) size = 'S';
    else if (w < 82) size = 'M';
    else if (w < 95) size = 'L';
    else size = 'XL';
    
    setAdvisorResult(size);
  };

  const tabs = [
    { id: 'shipping', label: 'Shipping & Returns', icon: Truck, subtitle: 'Logistics and global delivery' },
    { id: 'size-guide', label: 'Sizing & Fit Advisor', icon: Ruler, subtitle: 'Measurement specs & interactive tool' },
    { id: 'privacy', label: 'Privacy & Cookies', icon: ShieldCheck, subtitle: 'Personal data & safety protocols' },
    { id: 'terms', label: 'Terms of Use', icon: FileText, subtitle: 'Order rules & site terms' },
  ];

  return (
    <div className="pt-40 pb-40 min-h-screen bg-charcoal text-alabaster selection:bg-bloodred selection:text-alabaster font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        
        {/* Header Section */}
        <header className="border-b border-white/10 pb-12 space-y-6">
          <div className="flex items-center gap-3">
            <HelpCircle className="text-bloodred animate-pulse" size={16} />
            <span className="text-[10px] uppercase tracking-[0.4em] text-bloodred font-bold block">
              SUPPORT // CLIENT HUB
            </span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-serif text-alabaster leading-none tracking-tight uppercase">
                Client Services
              </h1>
              <p className="text-xs font-light text-alabaster/60 max-w-xl leading-relaxed mt-4">
                We are dedicated to providing each customer a stress free and amazing experience. Browse our shipping policies utilise our interactive size advisor and read our terms below.
              </p>
            </div>
            <div className="text-[9px] uppercase tracking-widest font-mono text-alabaster/40 font-bold bg-white/5 border border-white/10 px-4 py-2">
              Last Updated // MAY 2026
            </div>
          </div>
        </header>

        {/* Dashboard Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 items-start">
          
          {/* Navigation Sidebar */}
          <div className="space-y-3 lg:sticky lg:top-36 bg-[#090909] border border-white/5 p-6 rounded-sm">
            <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-stone block mb-4">
              Help Categories
            </span>
            <div className="flex flex-col gap-2">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full text-left p-4 rounded-sm transition-all duration-300 group flex items-start gap-4 border ${
                      isActive 
                        ? 'bg-bloodred/10 border-bloodred text-alabaster' 
                        : 'bg-transparent border-transparent text-alabaster/55 hover:bg-white/5 hover:text-alabaster'
                    }`}
                  >
                    <Icon size={18} className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-bloodred' : 'text-stone group-hover:text-bloodred transition-colors'}`} />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono opacity-40">0{idx + 1}</span>
                        <h3 className="text-xs uppercase tracking-widest font-bold font-sans">
                          {tab.label}
                        </h3>
                      </div>
                      <p className="text-[9px] text-stone leading-tight font-light lowercase">
                        {tab.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details Content Pane */}
          <div className="lg:col-span-3 min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-8"
              >
                
                {/* Shipping & Returns Tab */}
                {activeTab === 'shipping' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left Column: Methods */}
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-bloodred font-bold mb-4">01 / Shipping Protocols</h3>
                        <p className="text-sm font-light text-alabaster/70 leading-relaxed mb-6">
                          Each piece is carefully packaged straight from our production centers and shipped to each customer through our reliable global logistics networks.
                        </p>
                        <div className="bg-[#0A0A0A] border border-white/5 divide-y divide-white/5 rounded-sm overflow-hidden">
                          <div className="p-5 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-alabaster">Standard Courier</p>
                              <p className="text-[9px] text-stone uppercase tracking-widest mt-1">5 - 7 Business Days</p>
                            </div>
                            <span className="text-[10px] font-bold text-bloodred uppercase tracking-wider bg-bloodred/10 border border-bloodred/25 px-2.5 py-1 text-right max-w-[200px]" suppressHydrationWarning>
                              PRICE RANGES FROM NGN 4,000 - NGN 10,000 NATIONWIDE
                            </span>
                          </div>

                          <div className="p-5 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-alabaster">International Deliveries</p>
                              <p className="text-[9px] text-stone uppercase tracking-widest mt-1">5 - 10 Business Days</p>
                            </div>
                            <span className="text-[10px] font-bold text-bloodred uppercase tracking-wider bg-bloodred/10 border border-bloodred/25 px-2.5 py-1 text-right max-w-[200px]" suppressHydrationWarning>
                              RANGES FROM NGN 15,000 - NGN 30,000 WORLDWIDE
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-white/5">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-bloodred font-bold mb-4">02 / Terms & Conditions</h3>
                        <div className="space-y-4 text-xs font-light text-alabaster/70 leading-relaxed">
                          <p>
                            <strong className="text-alabaster font-bold block mb-1">IMPULSIVE TERMS AND CONDITIONS</strong>
                          </p>
                          <ul className="space-y-3 list-none">
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>Drops take up within 2 weeks for delivery unless stated otherwise under the product description.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>Pre-order / sale drops require up to 3 weeks before delivery.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>Shipping fees are non-negotiable and must be paid fully before the item is shipped out for fulfilment.</span>
                            </li>
                          </ul>
                          
                          <p>
                            <strong className="text-alabaster font-bold block mt-6 mb-1">ADDITIONAL IMPULSIVE-ALIGNED TERMS:</strong>
                          </p>
                          <ul className="space-y-3 list-none">
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>All sales are final. No refunds after payment confirmation.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>Exchanges are only allowed for wrong sizes or defective items, reported within 48 hours of delivery.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>IMPULSIVE is not responsible for delays caused by third-party couriers.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>Orders not claimed within 7 days of delivery notice may be rescheduled at the buyer&apos;s expense.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>Product colors may vary slightly due to lighting and screen display - this does not qualify for a return.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Return Info */}
                    <div className="bg-[#0A0A0A] border-l-2 border-bloodred border-y border-r border-white/5 p-8 md:p-10 space-y-8 rounded-sm">
                      <div>
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-bloodred font-bold mb-4">03 / Refund & Exchange</h3>
                        <div className="space-y-4 text-xs font-light text-alabaster/70 leading-relaxed">
                          <p>
                            <strong className="text-alabaster font-bold block mb-1">ALL SALES ARE FINAL. WE DO NOT OFFER REFUNDS UNLESS THE ITEM IS UNAVAILABLE OR IF THE ITEM IS LOST IN TRANSIT.</strong>
                          </p>
                          <ul className="space-y-3 list-none">
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>The item must be filed for return within 7 days of its delivery. Item must be unworn, unwashed and in original packaging.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>No returns on custom pieces and discounted items.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>No refund on items lost due to wrong delivery information from the customer.</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>Refunds go back to your payment method (minus delivery fee).</span>
                            </li>
                            <li className="flex gap-3">
                              <span className="text-bloodred mt-1">•</span>
                              <span>Want an exchange? If we have your size, it&apos;s a go. If not, store credit or refund.</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-alabaster">How to file a return</h4>
                        <p className="text-xs font-light text-alabaster/60 leading-relaxed">
                          To begin a return claim, contact our stylist concierge service directly, quoting your Order Reference ID.
                        </p>
                        <a 
                          href="mailto:wearimpulsive@gmail.com" 
                          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-bloodred hover:text-white transition-colors group pt-2"
                        >
                          Send Email to Concierge <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>

                  </div>
                )}

                {/* Sizing & Fit Advisor Tab */}
                {activeTab === 'size-guide' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left Column: Silhouettes & Grid */}
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-bloodred font-bold mb-4">Silhouette & Proportions</h3>
                        <p className="text-sm font-light text-alabaster/75 leading-relaxed italic">
                          Garments feature a heavy-cropped structure with dropped shoulders and raw hem elements. They are engineered to look boxy. If you prefer a traditional tailored fit, we recommend selecting one size smaller.
                        </p>
                      </div>

                      <div className="border border-white/5 text-[10px] text-alabaster/75 overflow-hidden bg-[#0A0A0A] rounded-sm shadow-sm divide-y divide-white/5">
                        <div className="grid grid-cols-4 bg-white/5 p-4 font-bold text-[9px] uppercase tracking-widest text-stone">
                          <span>Size</span>
                          <span>Chest (in)</span>
                          <span>Shoulder (in)</span>
                          <span>Length (in)</span>
                        </div>
                        {[
                          { s: 'XS', c: '46"', sh: '20"', l: '26"' },
                          { s: 'S', c: '48"', sh: '21"', l: '27"' },
                          { s: 'M', c: '50"', sh: '22"', l: '28"' },
                          { s: 'L', c: '52"', sh: '23"', l: '29"' },
                          { s: 'XL', c: '54"', sh: '24"', l: '30"' },
                        ].map((row) => (
                          <div key={row.s} className="grid grid-cols-4 p-4 hover:bg-white/[0.02] transition-colors">
                            <span className="font-bold text-bloodred">{row.s}</span>
                            <span>{row.c}</span>
                            <span>{row.sh}</span>
                            <span>{row.l}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Size Advisor Form */}
                    <div className="bg-[#0A0A0A] border border-white/5 p-8 md:p-10 space-y-6 rounded-sm">
                      <div>
                        <h3 className="text-xl font-serif text-alabaster font-bold">Interactive Fit Advisor</h3>
                        <p className="text-[9px] uppercase tracking-widest text-stone mt-1">Get precise size recommendations instantly</p>
                      </div>

                      <form onSubmit={calculateAdvisorSize} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest font-semibold text-stone mb-2">Height (cm)</label>
                            <input 
                              type="number" 
                              placeholder="e.g. 178" 
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                              className="w-full bg-[#111111] border border-white/10 px-4 py-4 text-xs tracking-widest font-semibold text-alabaster focus:outline-none focus:border-bloodred focus:ring-1 focus:ring-bloodred rounded-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] uppercase tracking-widest font-semibold text-stone mb-2">Weight (kg)</label>
                            <input 
                              type="number" 
                              placeholder="e.g. 74" 
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              className="w-full bg-[#111111] border border-white/10 px-4 py-4 text-xs tracking-widest font-semibold text-alabaster focus:outline-none focus:border-bloodred focus:ring-1 focus:ring-bloodred rounded-sm"
                              required
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-bloodred text-alabaster py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-white hover:text-charcoal transition-colors rounded-sm"
                        >
                          Analyze Sizing Profile
                        </button>
                      </form>

                      <AnimatePresence>
                        {advisorResult && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="border-t border-white/5 pt-6 mt-6 space-y-4"
                          >
                            <div className="flex justify-between items-baseline">
                              <span className="text-[9px] uppercase tracking-widest text-stone font-bold">Recommended Size</span>
                              <span className="text-4xl font-serif text-bloodred font-black tracking-widest animate-pulse">{advisorResult}</span>
                            </div>
                            <p className="text-[10px] text-alabaster/60 leading-relaxed font-light">
                              For the intended boxy aesthetic, we suggest size <span className="font-bold text-bloodred">{advisorResult}</span>. If you want a tailored fit, we advise selecting one size down.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                )}

                {/* Privacy & Cookies Tab */}
                {activeTab === 'privacy' && (
                  <div className="max-w-4xl space-y-12">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.3em] text-bloodred font-bold mb-4">01 / Security Commitment</h3>
                      <p className="text-lg font-light text-alabaster/70 leading-relaxed italic">
                        At Impulsive Studio, we value the confidentiality of your digital transaction data. This policy outlines how we process and protect your sizing and transaction inputs.
                      </p>
                    </div>

                    <div className="space-y-8 font-light text-alabaster/60 text-sm leading-relaxed">
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-alabaster">02 / Information Fulfillments</h4>
                        <p className="text-xs">
                          We gather only essential data to execute transactions, containing billing coordinates, sizing choices, and verified checkout emails. Credit cards are secured and processed using TLS-certified external gateways.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-alabaster">03 / Data Security</h4>
                        <p className="text-xs">
                          Your account files and tracking preferences are stored securely. We limit internal staff authorization protocols and do not lease or lease account information to tracking vendors.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-alabaster">04 / Session Cookies</h4>
                        <p className="text-xs">
                          We use minimal browser cookies to track items in your bag, retain styling filters, and store size advisor measurements to personalize client services.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms of Use Tab */}
                {activeTab === 'terms' && (
                  <div className="max-w-4xl space-y-12">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.3em] text-bloodred font-bold mb-4">01 / User Agreement</h3>
                      <p className="text-lg font-light text-alabaster/70 leading-relaxed italic">
                        By browsing IMPULSIVE Studio collections or checking out products, you agree to comply with our Terms of Use.
                      </p>
                    </div>

                    <div className="space-y-8 font-light text-alabaster/60 text-sm leading-relaxed">
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-alabaster">02 / Product Order Fulfillment</h4>
                        <p className="text-xs">
                          We reserve the right to review order allocations. If we cancel a payment, our concierge styling service will reach out to explain order status. Custom text print designs are reviewed against decency terms.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-alabaster">03 / Trademark & Designs</h4>
                        <p className="text-xs">
                          All textile patterns, custom screen-printed text overlays, site designs, media files, and code structures remain exclusive intellectual property of Impulsive Studio.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-alabaster">04 / Liability Conditions</h4>
                        <p className="text-xs">
                          Impulsive Studio is not responsible for shipment issues arising from incorrect user address entries or custom print spelling mistakes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
