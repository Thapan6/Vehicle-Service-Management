import React from 'react';
import { 
  UsersIcon, 
  TruckIcon, 
  CreditCardIcon 
} from '../utils/Icons';

const Privacy = () => {
  const sections = [
    {
      title: 'Information We Collect',
      desc: 'To provide a seamless fleet and service management experience, we collect specific information depending on your platform role.',
      icon: UsersIcon,
      items: [
        'Account Credentials: Username, name, email address, password hashes, and user roles.',
        'Vehicle Metadata: Vehicle Identification Number (VIN), make, model, year, and license plate detail.',
        'Service History: Ticket status, repair logs, technician assignments, and diagnostic notes.',
        'Billing Accounts: Invoices, line-item costs, and payment confirmation tokens.'
      ]
    },
    {
      title: 'How We Use Your Information',
      desc: 'We utilize your collected details strictly to power the service booking flow and maintain transparency across all participants.',
      icon: TruckIcon,
      items: [
        'Scheduling Coordination: Connecting customer vehicles with available service bay slots.',
        'Technician Allocations: Enabling service managers to route task sheets to mechanics.',
        'Billing Generation: Synthesizing diagnostic notes, parts used, and labor hours into invoices.',
        'Platform Notifications: Disbursing real-time status updates on vehicle progress.'
      ]
    },
    {
      title: 'Data Security & Protection',
      desc: 'Security is a core pillar of the VSM Platform. We enforce modern protocols to protect user data from unauthorized exposure.',
      icon: LockIcon,
      items: [
        'Role-Based Database Restrictions: Restricting technician views to assignments, and customer views to personal garages.',
        'Data Encryption: Encrypting passwords, session payloads, and transaction tokens in transit and at rest.',
        'Regular Security Auditing: Proactively analyzing access logs and configuration rules for potential leaks.'
      ]
    }
  ];

  return (
    <div className="relative py-16 px-6 sm:px-12 max-w-7xl mx-auto overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {/* --- PAGE HEADER --- */}
      <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
          Privacy <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Policy</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Your trust is our priority. Read on to learn how we protect your personal, 
          vehicle, and operational data.
        </p>
      </div>

      {/* --- CONTENT CARDS --- */}
      <section className="space-y-12 relative z-10 max-w-5xl mx-auto mb-20">
        {sections.map((section, index) => (
          <div key={index} className="glass p-8 md:p-12 border-slate-200/50 dark:border-slate-800/50 hover:border-primary/20 transition-colors duration-300">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="p-4 bg-primary/10 dark:bg-primary/5 text-primary rounded-2xl shadow-sm">
                <section.icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">{section.title}</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{section.desc}</p>
                
                <ul className="space-y-4">
                  {section.items.map((item, itemIdx) => {
                    const [boldText, normalText] = item.split(': ');
                    return (
                      <li key={itemIdx} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong className="text-slate-800 dark:text-white font-extrabold">{boldText}</strong>
                          {normalText && `: ${normalText}`}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* --- CALLOUT SECTION --- */}
      <section className="max-w-3xl mx-auto text-center relative z-10 glass p-8 md:p-12 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-4">Questions or Concerns?</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          If you have questions regarding this privacy policy, data deletion requests, or information audits, 
          please get in touch with our system administration team.
        </p>
        <span className="text-sm font-black text-primary uppercase tracking-widest bg-primary/10 px-6 py-3 rounded-xl border border-primary/20">
          support@vsmplatform.com
        </span>
      </section>
    </div>
  );
};

// Fallback Lock Icon
const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export default Privacy;
