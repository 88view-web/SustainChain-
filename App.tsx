import React, { useState, useEffect } from 'react';
import { 
  Building2, CheckSquare, Users, FileText, 
  Trash2, Plus, Save, ClipboardList, ArrowLeft,
  AlertTriangle, Target, Activity, ShieldAlert,
  Printer, Trash, BarChart3
} from 'lucide-react';

// --- Types & Interfaces ---

type RiskLevel = '低風險' | '中風險' | '高風險' | '未評估';
type TaskStatus = '未開始' | '進行中' | '已完成';
type Priority = '高' | '中' | '低';
type SpendLevel = '高' | '中' | '低';
type ImportanceLevel = '高' | '中' | '低';
type Category = '環境' | '社會' | '治理' | '供應鏈';

interface Company {
  name: string;
  industry: string;
  employeeCount: number;
  hasFactory: boolean;
  hasExport: boolean;
  supplierCount: number;
  hasIso14001: boolean;
  hasIso14064: boolean;
  hasEsgReport: boolean;
}

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  location: string;
  supplyCategory: string;
  annualSpend: SpendLevel;
  isKeySupplier: boolean;
  importance: ImportanceLevel;
  score: number;
  eScore: number;
  sScore: number;
  gScore: number;
  risk: RiskLevel;
  surveyCompleted: boolean;
}

interface SustainabilityTask {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  owner: string;
  reason: string;
  status: TaskStatus;
}

interface ImprovementPlan {
  id: string;
  supplierId: string;
  supplierName: string;
  issue: string;
  suggestion: string;
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
}

const defaultCompany: Company = {
  name: '',
  industry: '',
  employeeCount: 0,
  hasFactory: false,
  hasExport: false,
  supplierCount: 0,
  hasIso14001: false,
  hasIso14064: false,
  hasEsgReport: false,
};

// --- Main Application Component ---

export default function App() {
  // LocalStorage State Initialization
  const [company, setCompany] = useState<Company>(() => {
    const saved = localStorage.getItem('sc_company');
    return saved ? JSON.parse(saved) : defaultCompany;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('sc_suppliers');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<SustainabilityTask[]>(() => {
    const saved = localStorage.getItem('sc_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [improvements, setImprovements] = useState<ImprovementPlan[]>(() => {
    const saved = localStorage.getItem('sc_improvements');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState(company.name ? 'report' : 'diagnosis');
  const [toastMsg, setToastMsg] = useState('');
  
  // UI 狀態控制
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // 表單暫存狀態
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '', contactName: '', email: '', location: '', supplyCategory: '', annualSpend: '中', isKeySupplier: false
  });
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, number>>({});

  // --- Effects (Persist to LocalStorage) ---
  useEffect(() => { localStorage.setItem('sc_company', JSON.stringify(company)); }, [company]);
  useEffect(() => { localStorage.setItem('sc_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('sc_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('sc_improvements', JSON.stringify(improvements)); }, [improvements]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // --- 業務邏輯 ---

  const handleClearData = () => {
    if (window.confirm('確定要清除所有資料嗎？此操作將清空所有本地紀錄且無法還原。')) {
      localStorage.clear();
      setCompany(defaultCompany);
      setSuppliers([]);
      setTasks([]);
      setImprovements([]);
      setActiveTab('diagnosis');
      showToast('所有資料已清除');
    }
  };

  const calculateMaturity = () => {
    let score = 0;
    if (company.hasIso14001) score++;
    if (company.hasIso14064) score++;
    if (company.hasEsgReport) score++;
    
    if (score === 3) return '成熟階段';
    if (score >= 1 || company.supplierCount > 0) return '建立中階段';
    return '初期階段';
  };

  const getRiskSources = () => {
    const risks = [];
    if (company.supplierCount > 0) risks.push('供應鏈管理風險：缺乏系統性的供應商 ESG 數據追蹤');
    if (company.hasFactory && !company.hasIso14064) risks.push('碳排合規風險：工廠碳排放數據缺乏確信，面臨減碳壓力');
    if (!company.hasIso14001) risks.push('環境管理風險：尚未建立國際認可之環境管理系統');
    if (!company.hasEsgReport) risks.push('資訊揭露風險：缺乏系統性 ESG 資訊揭露，不利利害關係人溝通');
    if (company.hasExport) risks.push('法規貿易風險：面臨 CBAM 等國際碳邊境稅及出口法規要求');
    return risks.length ? risks : ['目前無明顯重大風險'];
  };

  const handleGenerateTasks = () => {
    const newTasks: SustainabilityTask[] = [];
    const addTask = (title: string, category: Category, priority: Priority, owner: string, reason: string) => {
      newTasks.push({ id: `task_${Date.now()}_${Math.random()}`, title, category, priority, owner, reason, status: '未開始' });
    };

    if (company.hasFactory) addTask('建立每月能源使用與廢棄物處理紀錄', '環境', '高', '廠務部', '工廠營運基本合規與減碳基礎要求');
    if (company.hasExport) addTask('整理國際客戶 ESG 規範與碳邊境稅要求', '治理', '高', '業務部', '應對國際貿易壁壘與客戶要求');
    if (company.supplierCount > 0) addTask('建立供應商名單並發送 ESG 評估問卷', '供應鏈', '高', '採購部', '鑑別供應鏈永續風險');
    if (!company.hasIso14001) addTask('評估導入 ISO 14001 環境管理系統', '環境', '中', '永續部', '建立標準化環境管理機制');
    if (!company.hasIso14064) addTask('啟動組織型溫室氣體盤查 (ISO 14064)', '環境', '高', '永續部', '掌握自身碳排基線');
    if (!company.hasEsgReport) addTask('彙整跨部門資料產出 ESG 永續報告書', '治理', '中', '永續部', '回應投資人與外界資訊揭露期待');

    if (newTasks.length === 0) addTask('成立內部永續發展推動委員會', '治理', '高', '總經理室', '啟動企業 ESG 轉型');

    setTasks(newTasks);
    showToast('永續任務已成功產生並儲存！');
    setActiveTab('tasks');
  };

  const getImportance = (isKey: boolean, spend: SpendLevel): ImportanceLevel => {
    if (isKey && spend === '高') return '高';
    if (isKey || spend === '中') return '中';
    return '低';
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name) {
      alert('請輸入供應商名稱');
      return;
    }
    const spend = newSupplier.annualSpend as SpendLevel;
    const supplier: Supplier = {
      id: `sup_${Date.now()}`,
      name: newSupplier.name,
      contactName: newSupplier.contactName || '',
      email: newSupplier.email || '',
      location: newSupplier.location || '',
      supplyCategory: newSupplier.supplyCategory || '',
      annualSpend: spend,
      isKeySupplier: newSupplier.isKeySupplier || false,
      importance: getImportance(newSupplier.isKeySupplier || false, spend),
      score: 0,
      eScore: 0,
      sScore: 0,
      gScore: 0,
      risk: '未評估',
      surveyCompleted: false
    };
    setSuppliers([...suppliers, supplier]);
    setNewSupplier({ name: '', contactName: '', email: '', location: '', supplyCategory: '', annualSpend: '中', isKeySupplier: false });
    setIsAddingSupplier(false);
    showToast('供應商新增成功！');
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('確定要刪除此供應商嗎？將一併刪除其改善計畫。')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
      setImprovements(improvements.filter(i => i.supplierId !== id));
      showToast('供應商已刪除');
    }
  };

  const getDaysFromNow = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const handleSurveySubmit = (supplierId: string) => {
    if (Object.keys(surveyAnswers).length < 9) {
      alert('請回答所有問卷題目後再送出。');
      return;
    }

    const qMap = [
      { id: 'env_1', category: 'E', issue: '缺乏能源使用紀錄', text: '建立每月能源與水電使用追蹤表' },
      { id: 'env_2', category: 'E', issue: '缺乏碳排放紀錄', text: '啟動溫室氣體盤查與碳足跡計算' },
      { id: 'env_3', category: 'E', issue: '缺乏廢棄物處理紀錄', text: '建立廢棄物清運與回收追蹤機制' },
      { id: 'soc_1', category: 'S', issue: '缺乏職業安全制度', text: '制訂職安衛政策並落實員工訓練' },
      { id: 'soc_2', category: 'S', issue: '缺乏工時管理制度', text: '導入合規的出勤與工時追蹤系統' },
      { id: 'soc_3', category: 'S', issue: '缺乏員工申訴管道', text: '建立保密且暢通的勞資溝通與申訴機制' },
      { id: 'gov_1', category: 'G', issue: '尚未完全遵守當地法規', text: '進行法規查核並修正違規事項' },
      { id: 'gov_2', category: 'G', issue: '缺乏反貪腐政策', text: '頒布商業道德守則與反貪腐聲明' },
      { id: 'gov_3', category: 'G', issue: '無法提供佐證文件', text: '盤點並整理所有 ESG 相關佐證與政策文件' }
    ];

    let eRaw = 0, sRaw = 0, gRaw = 0;
    const newImps: ImprovementPlan[] = [];
    const sup = suppliers.find(s => s.id === supplierId);

    qMap.forEach(q => {
      const score = surveyAnswers[q.id];
      if (q.category === 'E') eRaw += score;
      if (q.category === 'S') sRaw += score;
      if (q.category === 'G') gRaw += score;

      if (score < 5) {
        newImps.push({
          id: `imp_${Date.now()}_${q.id}`,
          supplierId,
          supplierName: sup?.name || '',
          issue: q.issue,
          suggestion: q.text,
          priority: score === 0 ? '高' : '中',
          dueDate: score === 0 ? getDaysFromNow(30) : getDaysFromNow(60),
          status: '未開始'
        });
      }
    });

    const eScore = Math.round((eRaw / 15) * 100);
    const sScore = Math.round((sRaw / 15) * 100);
    const gScore = Math.round((gRaw / 15) * 100);
    const totalScore = Math.round(eScore * 0.4 + sScore * 0.3 + gScore * 0.3);
    
    let risk: RiskLevel = '低風險';
    if (totalScore < 60) risk = '高風險';
    else if (totalScore < 80) risk = '中風險';

    const updatedSuppliers = suppliers.map(s => 
      s.id === supplierId 
        ? { ...s, score: totalScore, eScore, sScore, gScore, risk, surveyCompleted: true } 
        : s
    );
    
    setSuppliers(updatedSuppliers);
    setImprovements([...improvements, ...newImps]);
    setSurveyAnswers({});
    setSelectedSupplierId(null);
    showToast(`評估完成！總分：${totalScore}，系統已自動產生 ${newImps.length} 項改善計畫。`);
  };

  // --- UI Components ---

  const PriorityBadge = ({ priority }: { priority: Priority }) => (
    <span className={`px-2 py-1 rounded text-xs font-bold ${
      priority === '高' ? 'bg-red-100 text-red-700' :
      priority === '中' ? 'bg-amber-100 text-amber-700' :
      'bg-emerald-100 text-emerald-700'
    }`}>{priority}優先級</span>
  );

  const RiskBadge = ({ risk }: { risk: RiskLevel }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
      risk === '低風險' ? 'bg-emerald-100 text-emerald-700' :
      risk === '中風險' ? 'bg-amber-100 text-amber-700' :
      risk === '高風險' ? 'bg-red-100 text-red-700' :
      'bg-slate-100 text-slate-600'
    }`}>{risk}</span>
  );

  const SidebarItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: string }) => (
    <button
      onClick={() => { setActiveTab(id); setSelectedSupplierId(null); setIsAddingSupplier(false); }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col print:hidden">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <Target className="text-blue-400" />
          <span className="text-xl font-bold tracking-wide">SustainChain</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <SidebarItem icon={Activity} label="永續診斷" id="diagnosis" />
          <SidebarItem icon={CheckSquare} label="任務管理" id="tasks" />
          <SidebarItem icon={Users} label="供應商評估" id="suppliers" />
          <SidebarItem icon={ShieldAlert} label="改善計畫" id="improvements" />
          <SidebarItem icon={BarChart3} label="管理報告" id="report" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleClearData} className="flex items-center justify-center w-full space-x-2 px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
            <Trash size={16} />
            <span className="text-sm font-medium">清除所有資料</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10 print:hidden">
          <h1 className="text-2xl font-bold text-slate-800">
            {activeTab === 'diagnosis' && '企業永續診斷分析'}
            {activeTab === 'tasks' && '永續推動任務管理'}
            {activeTab === 'suppliers' && (selectedSupplierId ? '供應商 ESG 評分作業' : '供應商永續評估')}
            {activeTab === 'improvements' && '供應鏈改善計畫追蹤'}
            {activeTab === 'report' && '高階永續管理報告'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {company.name ? company.name : '尚未完成診斷'}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {toastMsg && (
            <div className="fixed top-20 right-8 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fade-in-down print:hidden">
              <CheckSquare size={18} className="text-emerald-400" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* === 永續診斷 Diagnosis === */}
          {activeTab === 'diagnosis' && (
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* 診斷表單 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                    <Building2 className="mr-2 text-blue-600"/> 基礎營運與現況調查
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">系統將根據您輸入的資料，自動判定永續成熟度並產出專屬任務清單。</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">公司名稱</label>
                    <input type="text" value={company.name} onChange={e => setCompany({...company, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">產業類別</label>
                    <input type="text" value={company.industry} onChange={e => setCompany({...company, industry: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">員工人數</label>
                    <input type="number" value={company.employeeCount} onChange={e => setCompany({...company, employeeCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">預估供應商數量</label>
                    <input type="number" value={company.supplierCount} onChange={e => setCompany({...company, supplierCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <label className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                      <input type="checkbox" checked={company.hasFactory} onChange={e => setCompany({...company, hasFactory: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                      <span className="font-medium text-slate-700">公司擁有製造工廠</span>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                      <input type="checkbox" checked={company.hasExport} onChange={e => setCompany({...company, hasExport: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                      <span className="font-medium text-slate-700">產品有出口海外需求</span>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                      <input type="checkbox" checked={company.hasIso14001} onChange={e => setCompany({...company, hasIso14001: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                      <span className="font-medium text-slate-700">已取得 ISO 14001</span>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                      <input type="checkbox" checked={company.hasIso14064} onChange={e => setCompany({...company, hasIso14064: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                      <span className="font-medium text-slate-700">已取得 ISO 14064</span>
                    </label>
                    <label className="col-span-1 md:col-span-2 flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                      <input type="checkbox" checked={company.hasEsgReport} onChange={e => setCompany({...company, hasEsgReport: e.target.checked})} className="w-5 h-5 text-blue-600 rounded" />
                      <span className="font-medium text-slate-700">過去曾發布過 ESG 永續報告書</span>
                    </label>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button onClick={handleGenerateTasks} className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all">
                    <Activity size={18} />
                    <span>執行診斷並產生任務</span>
                  </button>
                </div>
              </div>

              {/* 診斷結果 (如果有填寫公司名稱才顯示) */}
              {company.name && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-800 text-white p-6 rounded-xl shadow-md">
                    <h3 className="text-slate-300 font-medium mb-1">系統判定永續成熟度</h3>
                    <div className="text-3xl font-bold text-emerald-400 mt-2">{calculateMaturity()}</div>
                  </div>
                  <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center"><AlertTriangle className="text-amber-500 mr-2" size={18}/> 鑑別主要風險來源</h3>
                    <ul className="space-y-2">
                      {getRiskSources().map((risk, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start">
                          <span className="text-red-400 mr-2">•</span> {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === 任務管理 Tasks === */}
          {activeTab === 'tasks' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {tasks.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
                  <CheckSquare className="mx-auto w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 mb-4">目前沒有任務，請先至「永續診斷」執行分析。</p>
                  <button onClick={() => setActiveTab('diagnosis')} className="text-blue-600 font-bold hover:underline">前往診斷</button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm">
                        <th className="p-4 font-bold">任務名稱</th>
                        <th className="p-4 font-bold w-24">類別</th>
                        <th className="p-4 font-bold w-24">優先級</th>
                        <th className="p-4 font-bold w-32">負責單位</th>
                        <th className="p-4 font-bold">產生原因</th>
                        <th className="p-4 font-bold w-36">狀態</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {tasks.map(task => (
                        <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="p-4 font-bold text-slate-800">{task.title}</td>
                          <td className="p-4"><span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs">{task.category}</span></td>
                          <td className="p-4"><PriorityBadge priority={task.priority} /></td>
                          <td className="p-4 text-slate-600">{task.owner}</td>
                          <td className="p-4 text-slate-500 text-xs">{task.reason}</td>
                          <td className="p-4">
                            <select 
                              value={task.status}
                              onChange={(e) => {
                                const newTasks = tasks.map(t => t.id === task.id ? {...t, status: e.target.value as TaskStatus} : t);
                                setTasks(newTasks);
                              }}
                              className={`text-sm font-bold px-3 py-1.5 rounded outline-none cursor-pointer border ${
                                task.status === '未開始' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                task.status === '進行中' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <option value="未開始">未開始</option>
                              <option value="進行中">進行中</option>
                              <option value="已完成">已完成</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* === 供應商評估 Suppliers === */}
          {activeTab === 'suppliers' && !selectedSupplierId && (
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <span className="text-slate-500 text-sm font-medium">總供應商數量</span>
                  <span className="text-3xl font-bold text-slate-800 mt-2">{suppliers.length}</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <span className="text-slate-500 text-sm font-medium">已完成評估</span>
                  <span className="text-3xl font-bold text-blue-600 mt-2">{suppliers.filter(s => s.surveyCompleted).length}</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <span className="text-slate-500 text-sm font-medium">高風險數量</span>
                  <span className="text-3xl font-bold text-red-600 mt-2">{suppliers.filter(s => s.risk === '高風險').length}</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-center items-center">
                  <button onClick={() => setIsAddingSupplier(!isAddingSupplier)} className="w-full flex items-center justify-center space-x-2 bg-slate-800 text-white px-4 py-3 rounded-lg font-bold hover:bg-slate-900 transition-colors shadow-md">
                    <Plus size={18} />
                    <span>{isAddingSupplier ? '取消新增' : '新增供應商'}</span>
                  </button>
                </div>
              </div>

              {/* 新增供應商表單 */}
              {isAddingSupplier && (
                <div className="bg-white p-6 rounded-xl border-l-4 border-l-blue-600 border-y border-r border-slate-200 shadow-sm mb-6">
                  <h3 className="font-bold text-slate-800 mb-4">建檔新供應商</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">供應商名稱 *</label>
                      <input type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">供應品項</label>
                      <input type="text" value={newSupplier.supplyCategory} onChange={e => setNewSupplier({...newSupplier, supplyCategory: e.target.value})} className="w-full px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">所在地</label>
                      <input type="text" value={newSupplier.location} onChange={e => setNewSupplier({...newSupplier, location: e.target.value})} className="w-full px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">聯絡人</label>
                      <input type="text" value={newSupplier.contactName} onChange={e => setNewSupplier({...newSupplier, contactName: e.target.value})} className="w-full px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Email</label>
                      <input type="email" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} className="w-full px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">年度採購金額區間</label>
                      <select value={newSupplier.annualSpend} onChange={e => setNewSupplier({...newSupplier, annualSpend: e.target.value as SpendLevel})} className="w-full px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white">
                        <option value="高">高 (佔比 {'>'} 10%)</option>
                        <option value="中">中</option>
                        <option value="低">低</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-3 flex items-center justify-between mt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={newSupplier.isKeySupplier} onChange={e => setNewSupplier({...newSupplier, isKeySupplier: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm font-bold text-slate-700">設為關鍵供應商</span>
                      </label>
                      <button onClick={handleAddSupplier} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow">確認建檔</button>
                    </div>
                  </div>
                </div>
              )}

              {/* 供應商列表 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm">
                      <th className="p-4 font-bold">供應商資訊</th>
                      <th className="p-4 font-bold w-24">重要性</th>
                      <th className="p-4 font-bold w-32">評估狀態</th>
                      <th className="p-4 font-bold w-48">ESG 各面向分數</th>
                      <th className="p-4 font-bold w-32 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map(sup => (
                      <tr key={sup.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-800 text-base flex items-center">
                            {sup.name}
                            {sup.isKeySupplier && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded border border-blue-200">關鍵</span>}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{sup.supplyCategory || '未分類'} | {sup.location || '未知地點'}</div>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${sup.importance === '高' ? 'bg-purple-100 text-purple-700' : sup.importance === '中' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500'}`}>{sup.importance}</span>
                        </td>
                        <td className="p-4">
                          {sup.surveyCompleted ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-xl text-slate-800 mb-1">{sup.score} <span className="text-xs text-slate-500 font-normal">/100</span></span>
                              <RiskBadge risk={sup.risk} />
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 font-medium">尚未評估</span>
                          )}
                        </td>
                        <td className="p-4">
                          {sup.surveyCompleted ? (
                            <div className="space-y-1 text-xs font-medium">
                              <div className="flex justify-between items-center"><span className="text-emerald-700">E 環境</span> <span>{sup.eScore}</span></div>
                              <div className="flex justify-between items-center"><span className="text-blue-700">S 社會</span> <span>{sup.sScore}</span></div>
                              <div className="flex justify-between items-center"><span className="text-indigo-700">G 治理</span> <span>{sup.gScore}</span></div>
                            </div>
                          ) : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col space-y-2 items-center">
                            <button onClick={() => { setSelectedSupplierId(sup.id); setSurveyAnswers({}); }} className="text-xs font-bold bg-white border border-blue-600 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-50 transition w-full">
                              {sup.surveyCompleted ? '重新評分' : '發送問卷'}
                            </button>
                            <button onClick={() => handleDeleteSupplier(sup.id)} className="text-xs text-slate-400 hover:text-red-600 transition">刪除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {suppliers.length === 0 && <tr><td colSpan={5} className="text-center p-8 text-slate-500">尚無資料</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === ESG 評分問卷介面 === */}
          {activeTab === 'suppliers' && selectedSupplierId && (() => {
            const sup = suppliers.find(s => s.id === selectedSupplierId)!;
            
            const qSections = [
              { title: 'E 環境面 (40%)', category: 'E', items: [
                { id: 'env_1', text: '是否有建立明確的能源使用(水、電、燃料)追蹤紀錄？' },
                { id: 'env_2', text: '是否有進行溫室氣體(碳排放)盤查與紀錄？' },
                { id: 'env_3', text: '是否有合規的廢棄物清運與處理追蹤機制？' }
              ]},
              { title: 'S 社會面 (30%)', category: 'S', items: [
                { id: 'soc_1', text: '是否有推動職業安全衛生管理制度並落實教育訓練？' },
                { id: 'soc_2', text: '是否有符合法規規範之工時管理與薪酬制度？' },
                { id: 'soc_3', text: '是否有建立保密且暢通的勞工申訴與溝通管道？' }
              ]},
              { title: 'G 治理面 (30%)', category: 'G', items: [
                { id: 'gov_1', text: '過去三年內是否無重大違反當地環保或勞工法規之情事？' },
                { id: 'gov_2', text: '公司是否具備公開的商業道德守則與反貪腐政策？' },
                { id: 'gov_3', text: '是否能配合買方提供相關 ESG 政策文件與稽核佐證？' }
              ]}
            ];

            return (
              <div className="max-w-4xl mx-auto space-y-6">
                <button onClick={() => setSelectedSupplierId(null)} className="flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition">
                  <ArrowLeft size={16} className="mr-1" /> 返回供應商列表
                </button>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">ESG 風險評估問卷</h2>
                      <p className="text-slate-500 mt-1">受評對象：<span className="font-bold text-blue-700">{sup.name}</span></p>
                    </div>
                    <ClipboardList className="text-slate-300 w-10 h-10" />
                  </div>

                  <div className="space-y-8">
                    {qSections.map(section => (
                      <div key={section.category}>
                        <h3 className={`font-bold text-lg mb-4 ${section.category === 'E' ? 'text-emerald-700' : section.category === 'S' ? 'text-blue-700' : 'text-indigo-700'}`}>
                          {section.title}
                        </h3>
                        <div className="space-y-4">
                          {section.items.map((q, idx) => (
                            <div key={q.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition">
                              <p className="font-medium text-slate-800 mb-3 text-sm">
                                {idx + 1}. {q.text}
                              </p>
                              <div className="flex space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="radio" name={q.id} checked={surveyAnswers[q.id] === 5} onChange={() => setSurveyAnswers({...surveyAnswers, [q.id]: 5})} className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium">是 (5分)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="radio" name={q.id} checked={surveyAnswers[q.id] === 3} onChange={() => setSurveyAnswers({...surveyAnswers, [q.id]: 3})} className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium">部分符合 (3分)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input type="radio" name={q.id} checked={surveyAnswers[q.id] === 0} onChange={() => setSurveyAnswers({...surveyAnswers, [q.id]: 0})} className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium">否 (0分)</span>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                    <button onClick={() => handleSurveySubmit(sup.id)} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md">
                      計算評分並產生改善計畫
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* === 改善計畫 Improvements === */}
          {activeTab === 'improvements' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {improvements.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
                  <ShieldAlert className="mx-auto w-12 h-12 text-emerald-300 mb-4" />
                  <p className="text-slate-500">目前沒有需要追蹤的改善計畫。請先至「供應商評估」完成問卷。</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center text-sm text-slate-600">
                    <ShieldAlert size={18} className="mr-2 text-amber-500" /> 
                    <span>系統已根據問卷未達滿分項目，自動建立以下改善任務列管追蹤。</span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-slate-200 text-slate-600 text-sm">
                        <th className="p-4 font-bold">供應商</th>
                        <th className="p-4 font-bold">缺失項目與改善建議</th>
                        <th className="p-4 font-bold w-24">優先級</th>
                        <th className="p-4 font-bold w-32">建議期限</th>
                        <th className="p-4 font-bold w-36">追蹤狀態</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {improvements.map(imp => (
                        <tr key={imp.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="p-4 font-bold text-slate-800">{imp.supplierName}</td>
                          <td className="p-4">
                            <div className="text-red-500 font-bold mb-1">缺失：{imp.issue}</div>
                            <div className="text-slate-600 text-xs">建議：{imp.suggestion}</div>
                          </td>
                          <td className="p-4"><PriorityBadge priority={imp.priority} /></td>
                          <td className="p-4 text-slate-600 font-medium">{imp.dueDate}</td>
                          <td className="p-4">
                            <select 
                              value={imp.status}
                              onChange={(e) => {
                                const newImps = improvements.map(i => i.id === imp.id ? {...i, status: e.target.value as TaskStatus} : i);
                                setImprovements(newImps);
                              }}
                              className={`text-sm font-bold px-3 py-1.5 rounded outline-none cursor-pointer border ${
                                imp.status === '未開始' ? 'bg-red-50 text-red-700 border-red-200' :
                                imp.status === '進行中' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <option value="未開始">待回覆</option>
                              <option value="進行中">改善中</option>
                              <option value="已完成">已結案</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* === 管理報告 Report === */}
          {activeTab === 'report' && (
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none p-10 pb-20">
              
              <div className="flex justify-between items-start mb-10 pb-6 border-b-4 border-slate-800 print:border-b-2">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">高階永續管理報告</h1>
                  <p className="text-slate-500 font-bold text-lg">{company.name || '未輸入公司名稱'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 font-medium mb-2">產出日期：{new Date().toISOString().split('T')[0]}</p>
                  <button onClick={() => window.print()} className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900 print:hidden transition">
                    <Printer size={18} />
                    <span>列印 / 匯出 PDF</span>
                  </button>
                </div>
              </div>

              <div className="space-y-10">
                
                {/* 1. 永續體質總覽 */}
                <section>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-2 h-6 bg-blue-600 mr-3 rounded-sm"></span> 1. 企業永續體質總覽
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                      <div className="text-sm text-slate-500 font-bold mb-1">永續管理成熟度判定</div>
                      <div className="text-2xl font-black text-blue-700">{calculateMaturity()}</div>
                      <div className="mt-4 space-y-2 text-sm text-slate-700">
                        <div className="flex justify-between"><span>環境管理 (ISO 14001)</span> <span className="font-bold">{company.hasIso14001 ? '已建置' : '未建置'}</span></div>
                        <div className="flex justify-between"><span>碳排盤查 (ISO 14064)</span> <span className="font-bold">{company.hasIso14064 ? '已建置' : '未建置'}</span></div>
                        <div className="flex justify-between"><span>資訊揭露 (ESG 報告)</span> <span className="font-bold">{company.hasEsgReport ? '已發布' : '未發布'}</span></div>
                      </div>
                    </div>
                    <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                      <div className="text-sm text-red-600 font-bold mb-3">鑑別主要營運風險</div>
                      <ul className="space-y-2 text-sm text-red-800 font-medium list-disc pl-4">
                        {getRiskSources().map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 2. 供應鏈 ESG 績效 */}
                <section>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-2 h-6 bg-blue-600 mr-3 rounded-sm"></span> 2. 供應鏈 ESG 績效分析
                  </h3>
                  
                  {suppliers.length === 0 ? (
                    <p className="text-slate-500 bg-slate-50 p-6 rounded-xl text-center font-medium">尚無供應商數據，無法分析。</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                          <div className="text-sm font-bold text-slate-500">供應商總數</div>
                          <div className="text-3xl font-black text-slate-800 mt-1">{suppliers.length}</div>
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                          <div className="text-sm font-bold text-slate-500">評估完成率</div>
                          <div className="text-3xl font-black text-blue-600 mt-1">{Math.round((suppliers.filter(s => s.surveyCompleted).length / suppliers.length) * 100)}%</div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
                          <div className="text-sm font-bold text-emerald-800">整體平均分數</div>
                          <div className="text-3xl font-black text-emerald-600 mt-1">
                            {suppliers.filter(s => s.surveyCompleted).length > 0 
                              ? Math.round(suppliers.filter(s => s.surveyCompleted).reduce((acc, curr) => acc + curr.score, 0) / suppliers.filter(s => s.surveyCompleted).length) 
                              : 0}
                          </div>
                        </div>
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm">
                          <div className="text-sm font-bold text-red-800">高風險供應商</div>
                          <div className="text-3xl font-black text-red-600 mt-1">{suppliers.filter(s => s.risk === '高風險').length}</div>
                        </div>
                      </div>

                      {/* ESG 平均拆解 */}
                      {suppliers.filter(s => s.surveyCompleted).length > 0 && (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 flex justify-around items-center text-center">
                          <div>
                            <div className="text-sm font-bold text-slate-500 mb-1">環境面 (E) 平均</div>
                            <div className="text-2xl font-bold text-emerald-600">{Math.round(suppliers.filter(s=>s.surveyCompleted).reduce((acc,c)=>acc+c.eScore,0)/suppliers.filter(s=>s.surveyCompleted).length)}</div>
                          </div>
                          <div className="w-px h-12 bg-slate-300"></div>
                          <div>
                            <div className="text-sm font-bold text-slate-500 mb-1">社會面 (S) 平均</div>
                            <div className="text-2xl font-bold text-blue-600">{Math.round(suppliers.filter(s=>s.surveyCompleted).reduce((acc,c)=>acc+c.sScore,0)/suppliers.filter(s=>s.surveyCompleted).length)}</div>
                          </div>
                          <div className="w-px h-12 bg-slate-300"></div>
                          <div>
                            <div className="text-sm font-bold text-slate-500 mb-1">治理面 (G) 平均</div>
                            <div className="text-2xl font-bold text-indigo-600">{Math.round(suppliers.filter(s=>s.surveyCompleted).reduce((acc,c)=>acc+c.gScore,0)/suppliers.filter(s=>s.surveyCompleted).length)}</div>
                          </div>
                        </div>
                      )}

                      {/* 高風險列表 */}
                      {suppliers.filter(s => s.risk === '高風險').length > 0 && (
                        <div>
                          <h4 className="font-bold text-slate-800 mb-3">高風險供應商清單：</h4>
                          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-100">
                                <tr>
                                  <th className="p-3 font-bold">供應商</th>
                                  <th className="p-3 font-bold">重要性</th>
                                  <th className="p-3 font-bold">分數</th>
                                </tr>
                              </thead>
                              <tbody>
                                {suppliers.filter(s => s.risk === '高風險').map(sup => (
                                  <tr key={sup.id} className="border-t border-slate-100">
                                    <td className="p-3 font-bold">{sup.name}</td>
                                    <td className="p-3">{sup.importance}</td>
                                    <td className="p-3 text-red-600 font-bold">{sup.score}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </section>

                {/* 3. 管理行動與改善 */}
                <section>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-2 h-6 bg-blue-600 mr-3 rounded-sm"></span> 3. 管理行動與追蹤進度
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 rounded-xl p-6">
                      <h4 className="font-bold text-slate-700 mb-4">內部推動任務</h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-500">整體完成率</span>
                        <span className="text-xl font-black text-blue-600">
                          {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === '已完成').length / tasks.length) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: `${tasks.length > 0 ? Math.round((tasks.filter(t => t.status === '已完成').length / tasks.length) * 100) : 0}%`}}></div>
                      </div>
                      <div className="text-sm text-slate-600">總計 {tasks.length} 項任務，已完成 {tasks.filter(t => t.status === '已完成').length} 項。</div>
                    </div>
                    
                    <div className="border border-slate-200 rounded-xl p-6">
                      <h4 className="font-bold text-slate-700 mb-4">外部供應商改善計畫</h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-500">列管案件數</span>
                        <span className="text-xl font-black text-amber-600">{improvements.length}</span>
                      </div>
                      <div className="text-sm text-slate-600 space-y-1 mt-4">
                        <div className="flex justify-between"><span>待回覆</span> <span>{improvements.filter(i => i.status === '未開始').length}</span></div>
                        <div className="flex justify-between"><span>改善中</span> <span>{improvements.filter(i => i.status === '進行中').length}</span></div>
                        <div className="flex justify-between"><span>已結案</span> <span className="text-emerald-600 font-bold">{improvements.filter(i => i.status === '已完成').length}</span></div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 4. 系統建議 */}
                <section>
                   <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-2 h-6 bg-blue-600 mr-3 rounded-sm"></span> 4. 系統策略建議
                  </h3>
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-900 text-sm leading-relaxed font-medium space-y-3">
                    <p>【短期行動】盡速完成內部任務分配，並確保高風險供應商於期限內提交改善計畫回覆。</p>
                    <p>【中期目標】針對尚未實施溫室氣體盤查之工廠及高重要性供應商，啟動輔導機制，並預備相關認證評估。</p>
                    <p>【長期策略】建立常態性的 ESG 資料庫，將永續指標納入年度採購與決策考量，並研擬發布企業 ESG 永續報告書。</p>
                  </div>
                </section>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}