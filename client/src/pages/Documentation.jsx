import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  CalendarIcon, 
  TruckIcon, 
  CreditCardIcon, 
  WrenchIcon 
} from '../utils/Icons';

const Documentation = () => {
  const roles = [
    {
      title: 'Customer Portal',
      description: 'Your personal digital garage. Register multiple vehicles, request maintenance services on specific dates, view real-time service updates, and pay invoices online.',
      icon: UsersIcon,
      features: ['Add & Manage Vehicles', 'Book Maintenance Slots', 'Track Real-time Progress', 'Process Payments securely']
    },
    {
      title: 'Technician Hub',
      description: 'Built for the mechanics on the shop floor. View assigned jobs, log labor hours, request spare parts, and mark service tasks as complete with detail notes.',
      icon: WrenchIcon,
      features: ['View Active Assignments', 'Track Labor Hours', 'Log Spare Parts Utilized', 'Complete Service Logs']
    },
    {
      title: 'Service Center Dashboard',
      description: 'The operational command center. Monitor incoming bookings, assign technicians, manage invoice generations, and oversee shop floor bandwidth.',
      icon: TruckIcon,
      features: ['Approve & Assign Bookings', 'Manage Invoices', 'Track Tech Allocation', 'Review Performance Metrics']
    },
    {
      title: 'System Administrator',
      description: 'Full platform oversight. Provision user roles, manage system preferences, audit platform logs, and handle database backups.',
      icon: ShieldIcon,
      features: ['Role & User Provisioning', 'Platform Audit Logs', 'System Analytics', 'Database Backups & Configuration']
    }
  ];

  const lifecycles = [
    { step: '01', title: 'Service Scheduling', desc: 'Customers input vehicle info, choose an available date, and detail requested maintenance work.' },
    { step: '02', title: 'Work Assignment', desc: 'Service Center managers review slot availability and assign the ticket to an expert technician.' },
    { step: '03', title: 'Maintenance Logging', desc: 'Technicians work on the vehicle, logging labor time and parts used in real-time.' },
    { step: '04', title: 'Invoice Generation', desc: 'A line-item invoice is generated automatically containing labor rates and parts costs.' },
    { step: '05', title: 'Secure Payment', desc: 'Customers review the bill and process payments to complete the service cycle.' }
  ];

  return (
    <div className="relative py-16 px-6 sm:px-12 max-w-7xl mx-auto overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {/* --- PAGE HEADER --- */}
      <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
          Platform <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Documentation</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          Welcome to the VSM Platform guide. Explore features, role-based workflows, 
          and the complete vehicle service lifecycle.
        </p>
      </div>

      {/* --- LIFECYCLE GUIDE --- */}
      <section className="mb-24 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            The Service Lifecycle
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">How tickets flow from reservation to completion.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {lifecycles.map((life, index) => (
            <div key={index} className="glass p-6 border-slate-200/50 dark:border-slate-800/50 hover:border-primary/30 transition-all duration-300">
              <div className="text-3xl font-black text-primary/20 dark:text-primary/10 mb-4">{life.step}</div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{life.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{life.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- ROLE WORKFLOWS --- */}
      <section className="mb-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Roles & Operations
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Dedicated modules tailored for each participant.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role, idx) => (
            <div key={idx} className="glass p-8 md:p-10 border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
              <div>
                <div className="inline-flex p-3 rounded-2xl bg-primary/10 dark:bg-primary/5 text-primary mb-6 shadow-sm">
                  <role.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-4">{role.title}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {role.description}
                </p>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Core Capabilities</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {role.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="max-w-4xl mx-auto mb-12 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Quick answers to common inquiries.</p>
        </div>
        <div className="space-y-6">
          {[
            {
              q: 'How do I add a new vehicle?',
              a: 'Once logged in as a Customer, navigate to your Dashboard and click "Add Vehicle". Fill in the VIN, Make, Model, and Year details to add it to your garage.'
            },
            {
              q: 'How can I monitor the repair state?',
              a: 'Your customer portal dashboard features a progress tracker displaying stages like "Assigned", "In Progress", and "Completed". Technicians post details real-time.'
            },
            {
              q: 'Can a technician assign tasks to themselves?',
              a: 'No. Job ticketing allocation is handled centrally by the Service Center managers to guarantee optimization and fair work distribution.'
            }
          ].map((faq, fidx) => (
            <div key={fidx} className="glass p-6 md:p-8 border-slate-200/50 dark:border-slate-800/50">
              <h4 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white mb-2">{faq.q}</h4>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Fallback Shield Icon
const ShieldIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

export default Documentation;
