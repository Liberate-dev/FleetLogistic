import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import Layout from '../components/Layout';
import { useFleetOps } from '../context';

export default function AddNewCustomer() {
  const navigate = useNavigate();
  const { addCustomer, setLoading, addNotification } = useFleetOps();

  const [formData, setFormData] = useState({
    companyName: '',
    internalAlias: '',
    industrySector: 'Heavy Manufacturing',
    contactEmail: '',
    taxId: '',
    paymentTerms: 'Net 30',
    streetAddress: '',
    city: '',
    state: '',
    serviceLevel: 'standard',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.contactEmail) {
      addNotification({
        type: 'error',
        title: 'Form Tidak Lengkap',
        message: 'Mohon isi field yang wajib diisi.',
      });
      return;
    }

    setLoading(true);
    try {
      const customerData = {
        ...formData,
        id: `CUST-${Date.now()}`,
        address: `${formData.streetAddress}, ${formData.city}, ${formData.state}`,
        createdAt: new Date().toISOString(),
      };

      await addCustomer(customerData);

      addNotification({
        type: 'success',
        title: 'Customer Berhasil Ditambahkan',
        message: `${formData.companyName} telah didaftarkan.`,
      });

      setTimeout(() => navigate('/customers'), 1500);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Gagal Menambahkan Customer',
        message: error.message || 'Terjadi kesalahan.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <TopNavBar title="Add New Customer" breadcrumbs={['Customers', 'Add New Customer']} showBack={true} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 animate-fade-in">
        <div className="max-w-6xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tight">Client Intake</h2>
              <p className="text-sm text-slate-500 mt-1">Initialize new organizational profile and billing configuration.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/customers')}
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                Create Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-7 space-y-8">
              <section className="glass-panel rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-bold font-headline mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">domain</span>
                  Organization Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Legal Company Name *</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="e.g. Global Logistics Corp"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Internal Alias</label>
                    <input
                      type="text"
                      value={formData.internalAlias}
                      onChange={(e) => handleChange('internalAlias', e.target.value)}
                      placeholder="GLC_WEST"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Industry Sector</label>
                    <select
                      value={formData.industrySector}
                      onChange={(e) => handleChange('industrySector', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option>Pharmaceuticals</option>
                      <option>Heavy Manufacturing</option>
                      <option>Cold Chain Supply</option>
                      <option>Retail/E-commerce</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Primary Contact Email *</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      placeholder="operations@company.com"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
              </section>

              <section className="glass-panel rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-bold font-headline mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg">payments</span>
                  Billing & Compliance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Tax ID / VAT Number</label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => handleChange('taxId', e.target.value)}
                      placeholder="XX-XXXXXXX"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Payment Terms</label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => handleChange('paymentTerms', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                    >
                      <option>Net 30</option>
                      <option>Net 60</option>
                      <option>Due on Receipt</option>
                      <option>Custom Contract</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            <div className="col-span-12 lg:col-span-5 space-y-8">
              <section className="glass-panel rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    Address
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Street Address</label>
                      <input
                        type="text"
                        value={formData.streetAddress}
                        onChange={(e) => handleChange('streetAddress', e.target.value)}
                        placeholder="123 Logistics Way"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          placeholder="Jakarta"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">State/Prov</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleChange('state', e.target.value)}
                          placeholder="DKI Jakarta"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="glass-panel rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">settings</span>
                  Service Level
                </h3>
                <div className="space-y-3">
                  {['standard', 'enterprise'].map(level => (
                    <label
                      key={level}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.serviceLevel === level
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceLevel"
                        value={level}
                        checked={formData.serviceLevel === level}
                        onChange={() => handleChange('serviceLevel', level)}
                        className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                      />
                      <div>
                        <p className="font-bold text-sm">
                          {level === 'enterprise' ? 'Enterprise Priority' : 'Standard Managed'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {level === 'enterprise'
                            ? '24/7 dedicated dispatch and custom reporting.'
                            : 'Regular portal access and scheduled reports.'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-gradient-to-br from-primary to-[#2a3d2b] text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
              >
                Finalize Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
