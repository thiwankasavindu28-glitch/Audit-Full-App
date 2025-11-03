import React, { useState, useEffect, useMemo } from 'react'; // <-- IMPORT useMemo
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileText, Download, ArrowLeft, ClipboardX } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api'; 
import { useModal } from '../context/ModalContext'; 
import { SearchableDropdown } from '../components/SearchableDropdown'; // <-- 1. IMPORT NEW COMPONENT

// ... (errorCategories, getErrorByName, etc. are unchanged) ...
const errorCategories = {
    'General Errors': [
      { code: 'A', name: 'Duplicate Cue Sheet Processed as New', points: 100 },
      { code: 'B', name: 'Revision Cue Sheet Processed as New', points: 100 },
      { code: 'C', name: 'Incorrect Disposition', points: 100 },
      { code: 'D', name: 'Show Header Linked to Incorrect Series', points: 25 }
    ],
    'Header Errors': [
      { code: 'E', name: 'Naming Convention', points: 1 },
      { code: 'E', name: 'Airdate Error', points: 1 },
      { code: 'E', name: 'Production # Error', points: 1 },
    ],
    'Work Errors': [
      { code: 'F', name: 'Duplicate Work', payable: 5, nonPayable: 2.5 },
      { code: 'F', name: 'Linked Incorrect Work', payable: 5, nonPayable: 2.5 },
      { code: 'F', name: 'Added Incorrect Work', payable: 5, nonPayable: 2.5 },
      { code: 'F', name: 'Work Name Error', payable: 5, nonPayable: 2.5 },
    ],
    'Participant Errors': [
      { code: 'J', name: 'Incorrect Writer', payable: 5, nonPayable: 2.5 },
      { code: 'J', name: 'Added Incorrect Publisher', payable: 5, nonPayable: 2.5 },
      { code: 'J', name: 'Missing Participants', payable: 5, nonPayable: 2.5 },
      { code: 'J', name: 'Additional Participants', payable: 5, nonPayable: 2.5 },
      { code: 'J', name: 'Role Code Error', payable: 5, nonPayable: 2.5 },
    ],
    'Cue Errors': [
      { code: 'N', name: 'Cue Duration Error', payable: 5, nonPayable: 2.5 },
      { code: 'N', name: 'Usage Code Error', payable: 5, nonPayable: 2.5 },
      { code: 'N', name: 'Missing Cue Error', payable: 5, nonPayable: 2.5 },
      { code: 'N', name: 'Additional Cue Error', payable: 5, nonPayable: 2.5 },
    ],
    'Other': [
      { code: 'N/A', name: 'Other Error', points: 'Custom' }
    ]
  };
const getErrorByName = (name) => Object.values(errorCategories).flat().find(e => e.name === name);
const getErrorCategory = (name) => Object.keys(errorCategories).find(cat => errorCategories[cat].some(e => e.name === name)) || '';
const isGeneralError = (name) => getErrorCategory(name) === 'General Errors';
const isHeaderError = (name) => getErrorCategory(name) === 'Header Errors';
const isWorkError = (name) => getErrorCategory(name) === 'Work Errors';
const isParticipantError = (name) => getErrorCategory(name) === 'Participant Errors';
const isCueError = (name) => getErrorCategory(name) === 'Cue Errors';

const getPointText = (error) => {
if (error.points === 'Custom') return '(Custom pts)';
if (error.payable) return `(${error.nonPayable} / ${error.payable} pts)`;
return `(${error.points} pts)`;
};

const initialErrorState = {
  errorType: '',
  processedDate: new Date().toISOString().split('T')[0],
  parisMVS: '', userProcessedMVS: '', existingParisMVS: '',
  incorrectHeader: '', correctHeader: '', workType: 'Payable',
  cueSequence: '', addedWorkMVS: '', existingWorkMVS: '',
  incorrectValue: '', correctValue: '', incorrectName: '',
  correctName: '', correctIPI: '', missingName: '',
  additionalName: '', notes: '', customPoints: ''
};


const AuditWorkspace = () => {
  const { alert } = useModal(); 
  const [userName, setUserName] = useState('');
  const [auditDate, setAuditDate] = useState('');
  const [errors, setErrors] = useState([]);
  const [currentError, setCurrentError] = useState(initialErrorState);
  const [formError, setFormError] = useState(null);

  const { auditId } = useParams();
  const navigate = useNavigate();

  // --- 2. NEW: Format the errors for the dropdown ---
  // We use useMemo so this only runs once, not on every render
  const errorOptions = useMemo(() => {
    return Object.values(errorCategories).flat().map(err => ({
      value: err.name, // The value we save (e.g., "Duplicate Work")
      label: err.name, // The text to display/search
      code: err.code,
      points: getPointText(err),
    }));
  }, []);

  useEffect(() => {
    // ... (fetchAuditData function is unchanged) ...
    const fetchAuditData = async () => {
      try {
        const { data: auditData } = await api.get(`/audits/${auditId}`);
        setErrors(auditData.errors || []);
        setUserName(auditData.auditedUser.name);
        setAuditDate(new Date(auditData.startDate).toISOString().split('T')[0]);
      } catch (err) {
        console.error("Failed to fetch audit data", err);
        await alert("Could not load audit. Returning to dashboard.");
        navigate('/');
      }
    };
    fetchAuditData();
  }, [auditId, navigate, alert]);
  
  const resetForm = () => {
    // ... (this function is unchanged) ...
    setCurrentError(initialErrorState);
    setFormError(null);
  }

  const addError = async () => {
    // ... (this function is unchanged) ...
    setFormError(null); 
    const { errorType, workType } = currentError;
    
    if (!errorType) {
      setFormError('Please select an Error Type.');
      return;
    }
    
    let errorInfo = getErrorByName(errorType);
    if (!errorInfo) {
      setFormError('Invalid Error Type selected. Please choose from the list.');
      return;
    }
    
    let points = 0;

    if (errorType === 'Other Error') {
        points = parseFloat(currentError.customPoints);
        if (isNaN(points)) {
            setFormError('Please enter a valid number for custom points.'); 
            return;
        }
    } else if (errorInfo.payable) {
        points = workType === 'Payable' ? errorInfo.payable : errorInfo.nonPayable;
    } else {
        points = errorInfo.points;
    }
    
    const newErrorData = { 
      ...currentError, 
      code: errorInfo.code,
      name: errorInfo.name,
      points: points,
      customPoints: errorType === 'Other Error' ? points : null,
      processedDate: currentError.processedDate ? new Date(currentError.processedDate).toISOString() : null,
      errorType: getErrorCategory(errorType)
    };

    try {
      const { data: savedError } = await api.post(`/audits/${auditId}/errors`, newErrorData);
      setErrors([...errors, savedError]);
      
      setCurrentError({
        ...currentError, 
        userProcessedMVS: '',
        existingParisMVS: '',
        incorrectHeader: '',
        correctHeader: '',
        cueSequence: '',
        addedWorkMVS: '',
        existingWorkMVS: '',
        incorrectValue: '',
        correctValue: '',
        incorrectName: '',
        correctName: '',
        correctIPI: '',
        missingName: '',
        additionalName: '',
        notes: '',
        customPoints: ''
      });
      
    } catch (err) {
      console.error("Failed to add error", err);
      setFormError("Failed to save error. Please try again.");
    }
  };

  const removeError = async (id) => {
    // ... (this function is unchanged) ...
    try {
      await api.delete(`/audits/errors/${id}`);
      setErrors(errors.filter(e => e.id !== id));
    } catch (err) {
      console.error("Failed to delete error", err);
      await alert("Failed to remove error.");
    }
  };
  
  const calculateTotalPoints = () => errors.reduce((sum, error) => sum + (error.points || 0), 0).toFixed(2);

  const generateReport = async () => { 
    // ... (this function is unchanged) ...
    if (!userName) {
      await alert('Please enter the User Name before generating a report.');
      return;
    }
    const summary = [
      ["SuperQ Work Audit Report"], [],
      ["User Name:", userName], ["Audit Date:", auditDate],
      ["Total Errors:", errors.length], ["Total Points:", calculateTotalPoints()],
    ];
    const header = [
      'Error #', 'Processed Date', 'Code', 'Error Type', 'Error Name', 'Points', 'Paris MVS', 'User Processed MVS',
      'Existing Paris MVS', 'Incorrect Header', 'Correct Header', 'Work Type', 'Cue Sequence', 'Incorrect/Added MVS',
      'Correct/Existing MVS', 'Incorrect Name', 'Correct Name', 'Correct IPI',
      'Missing Name', 'Additional Name', 'Incorrect Value', 'Correct Value', 'Notes'
    ];
    const errorRows = errors.map((error, index) => [
      index + 1,
      error.processedDate ? new Date(error.processedDate).toLocaleDateString() : 'N/A',
      error.code,
      error.errorType,
      error.name,
      error.points,
      error.parisMVS,
      error.userProcessedMVS,
      error.existingParisMVS,
      error.incorrectHeader,
      error.correctHeader,
      error.workType,
      error.cueSequence,
      error.addedWorkMVS,
      error.existingWorkMVS,
      error.incorrectName,
      error.correctName,
      error.correctIPI,
      error.missingName,
      error.additionalName,
      error.incorrectValue,
      error.correctValue,
      error.notes
    ]);
    const finalData = [ ...summary, [], header, ...errorRows ];
    const ws = XLSX.utils.aoa_to_sheet(finalData);
    ws['!cols'] = [
      { wch: 8 }, { wch: 15 }, { wch: 6 }, { wch: 15 }, { wch: 35 }, { wch: 8 }, { wch: 15 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 40 }
    ];
    ws['A1'].s = { font: { bold: true, sz: 16 } };
    header.forEach((h, i) => {
        const cellRef = XLSX.utils.encode_cell({c: i, r: 7});
        if(ws[cellRef]) ws[cellRef].s = { font: { bold: true } };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Report");
    XLSX.writeFile(wb, `Audit_${userName.replace(/\s+/g, '_')}_${auditDate.replace(/\//g, '-')}.xlsx`);
  };

  const completeAudit = async () => {
    // ... (this function is unchanged) ...
    try {
        await api.put(`/audits/${auditId}`, { status: 'completed' });
        await alert("Audit marked as complete!");
        navigate('/'); 
    } catch (err) {
        console.error("Failed to complete audit", err);
        await alert("Could not update audit status.");
    }
  }

  const renderConditionalFields = () => {
    // ... (this function is unchanged) ...
    const { errorType } = currentError;
    if (!errorType) return null;
    
    // Define reusable dark mode input styles
    const inputClasses = "w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400";
    const labelClasses = "block text-sm font-medium text-slate-600 mb-1 dark:text-slate-300";
    
    if (errorType === 'Other Error') {
        return (
            <>
                <div className="md:col-span-2"><label className={labelClasses}>Paris Cue Sheet MVS #</label><input type="text" value={currentError.parisMVS} onChange={(e) => setCurrentError({ ...currentError, parisMVS: e.target.value })} className={inputClasses} /></div>
                <div className="md:col-span-2"><label className={labelClasses}>Custom Points *</label><input type="number" value={currentError.customPoints} onChange={(e) => setCurrentError({ ...currentError, customPoints: e.target.value })} className={inputClasses} placeholder="Enter points for this error" /></div>
            </>
        );
    }
    
    if (errorType === 'Show Header Linked to Incorrect Series') {
      return (
        <>
          <div className="md:col-span-2"><label className={labelClasses}>User Processed Paris MVS #</label><input type="text" value={currentError.userProcessedMVS} onChange={(e) => setCurrentError({ ...currentError, userProcessedMVS: e.target.value })} className={inputClasses} /></div>
          <div><label className={labelClasses}>User Linked Incorrect Header</label><input type="text" value={currentError.incorrectHeader} onChange={(e) => setCurrentError({ ...currentError, incorrectHeader: e.target.value })} className={inputClasses} /></div>
          <div><label className={labelClasses}>Correct Header</label><input type="text" value={currentError.correctHeader} onChange={(e) => setCurrentError({ ...currentError, correctHeader: e.target.value })} className={inputClasses} /></div>
        </>
      );
    }

    if (isGeneralError(errorType)) {
      return (
        <>
          <div><label className={labelClasses}>User Processed Paris MVS # *</label><input type="text" value={currentError.userProcessedMVS} onChange={(e) => setCurrentError({ ...currentError, userProcessedMVS: e.target.value })} className={inputClasses} placeholder="MVS user incorrectly processed" /></div>
          <div><label className={labelClasses}>Existing Paris MVS # *</label><input type="text" value={currentError.existingParisMVS} onChange={(e) => setCurrentError({ ...currentError, existingParisMVS: e.target.value })} className={inputClasses} placeholder="MVS already in system" /></div>
        </>
      );
    }

    const showBasicInfo = isHeaderError(errorType) || isWorkError(errorType) || isParticipantError(errorType) || isCueError(errorType);
    const showWorkTypeFields = isWorkError(errorType) || isParticipantError(errorType) || isCueError(errorType);
    const showAssociatedMVS = (isParticipantError(errorType)) || (isWorkError(errorType) && !['Duplicate Work', 'Linked Incorrect Work', 'Added Incorrect Work'].includes(errorType));
    
    return (
      <>
        {showBasicInfo && <div className="md:col-span-2"><label className={labelClasses}>Paris Cue Sheet MVS # *</label><input type="text" value={currentError.parisMVS} onChange={(e) => setCurrentError({ ...currentError, parisMVS: e.target.value })} className={inputClasses} placeholder="e.g., 2578440068" /></div>}
        
        {showWorkTypeFields && (
          <>
            <div><label className={labelClasses}>Work Type</label><select value={currentError.workType} onChange={(e) => setCurrentError({ ...currentError, workType: e.target.value })} className={inputClasses}><option>Payable</option><option>Non-Payable</option></select></div>
            <div><label className={labelClasses}>Cue Sequence</label><input type="text" value={currentError.cueSequence} onChange={(e) => setCurrentError({ ...currentError, cueSequence: e.target.value })} className={inputClasses} placeholder="e.g., 001, 002" /></div>
          </>
        )}
        
        {(errorType === 'Duplicate Work' || errorType === 'Linked Incorrect Work' || errorType === 'Added Incorrect Work') && (
          <>
            <div><label className={labelClasses}>{errorType === 'Duplicate Work' ? 'Duplicate Work MVS' : 'Incorrect/Added MVS'}</label><input type="text" value={currentError.addedWorkMVS} onChange={(e) => setCurrentError({ ...currentError, addedWorkMVS: e.target.value })} className={inputClasses}/></div>
            <div><label className={labelClasses}>{errorType === 'Duplicate Work' ? 'Existing Work MVS' : 'Correct Work MVS'}</label><input type="text" value={currentError.existingWorkMVS} onChange={(e) => setCurrentError({ ...currentError, existingWorkMVS: e.target.value })} className={inputClasses}/></div>
          </>
        )}
        {showAssociatedMVS && <div className="md:col-span-2"><label className={labelClasses}>Associated Work MVS #</label><input type="text" value={currentError.addedWorkMVS} onChange={(e) => setCurrentError({ ...currentError, addedWorkMVS: e.target.value })} className={inputClasses} placeholder="MVS of the work with the error" /></div>}
        {(errorType === 'Incorrect Writer' || errorType === 'Added Incorrect Publisher') && (
          <>
            <div><label className={labelClasses}>Incorrect Name</label><input type="text" value={currentError.incorrectName} onChange={(e) => setCurrentError({...currentError, incorrectName: e.target.value})} className={inputClasses}/></div>
            <div><label className={labelClasses}>Correct Name</label><input type="text" value={currentError.correctName} onChange={(e) => setCurrentError({...currentError, correctName: e.target.value})} className={inputClasses}/></div>
            <div className="md:col-span-2"><label className={labelClasses}>Correct IPI Number</label><input type="text" value={currentError.correctIPI} onChange={(e) => setCurrentError({...currentError, correctIPI: e.target.value})} className={inputClasses}/></div>
          </>
        )}
        {errorType === 'Missing Participants' && (
           <>
            <div><label className={labelClasses}>Missing Participant Name</label><input type="text" value={currentError.missingName} onChange={(e) => setCurrentError({...currentError, missingName: e.target.value})} className={inputClasses}/></div>
            <div><label className={labelClasses}>IPI Number</label><input type="text" value={currentError.correctIPI} onChange={(e) => setCurrentError({...currentError, correctIPI: e.target.value})} className={inputClasses}/></div>
           </>
        )}
        {errorType === 'Additional Participants' && (
           <>
            <div><label className={labelClasses}>Additional Participant Name</label><input type="text" value={currentError.additionalName} onChange={(e) => setCurrentError({...currentError, additionalName: e.target.value})} className={inputClasses}/></div>
            <div><label className={labelClasses}>IPI Number</label><input type="text" value={currentError.correctIPI} onChange={(e) => setCurrentError({...currentError, correctIPI: e.target.value})} className={inputClasses}/></div>
           </>
        )}
        
        {(errorType === 'Role Code Error' || errorType === 'Cue Duration Error' || errorType === 'Usage Code Error') && (
          <>
            <div><label className={labelClasses}>Incorrect Value</label><input type="text" value={currentError.incorrectValue} onChange={(e) => setCurrentError({...currentError, incorrectValue: e.target.value})} className={inputClasses}/></div>
            <div><label className={labelClasses}>Correct Value</label><input type="text" value={currentError.correctValue} onChange={(e) => setCurrentError({...currentError, correctValue: e.target.value})} className={inputClasses}/></div>
          </>
        )}
      </>
    );
  };

  // --- JSX ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ... (Header is unchanged) ... */}
        <header className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-700">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Workspace</h1>
                        <p className="text-slate-500 mt-1 dark:text-slate-400">Auditing: <span className="font-medium text-indigo-600 dark:text-indigo-400">{userName}</span> (ID: {auditId.substring(0, 10)}...)</p>
                    </div>
                </div>
                <button 
                    onClick={completeAudit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg"
                >
                    Complete Audit
                </button>
            </div>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-4 border-b border-slate-200 dark:text-white dark:border-slate-700">Add New Error</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1 dark:text-slate-300">Error Type *</label>
                  
                  {/* --- 3. REPLACEMENT: Use the new component --- */}
                  <SearchableDropdown
                    placeholder="Select an error..."
                    options={errorOptions}
                    value={currentError.errorType}
                    onChange={(value) => setCurrentError({ ...currentError, errorType: value })}
                  />
                  {/* --- END OF REPLACEMENT --- */}
                  
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1 dark:text-slate-300">Cue Sheet Processed Day</label>
                  <input type="date" value={currentError.processedDate} onChange={(e) => setCurrentError({ ...currentError, processedDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md transition focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:[color-scheme:dark]" />
                </div>
                {renderConditionalFields()}
              </div>
              <textarea value={currentError.notes} onChange={(e) => setCurrentError({ ...currentError, notes: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md transition focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" rows="3" placeholder="Additional notes..."></textarea>
              
              {formError && (
                <div className="my-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}
              
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={addError} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Plus size={20} /> Add Error
                </button>
                
                <button 
                  type="button" 
                  onClick={resetForm}
                  title="Clear all fields"
                  className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  <ClipboardX size={20} />
                  Clear Form
                </button>
              </div>
              
            </div>
            
            {/* ... (Error list rendering is unchanged) ... */}
            {errors.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recorded Errors ({errors.length})</h2>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Total Points: {calculateTotalPoints()}</div>
                </div>
                <div className="space-y-4">
                  {errors.map((error, index) => (
                    <div key={error.id} className="border border-slate-200 rounded-lg p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:hover:bg-slate-700/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-4">
                          <p className="font-semibold text-slate-800 dark:text-white">{index + 1}. {error.name} <span className="text-red-500 font-bold">({error.points} pts)</span></p>
                          <div className="text-sm text-slate-600 mt-2 space-y-1 dark:text-slate-300">
                            {Object.entries(error).map(([key, value]) => {
                              if (value && !['id', 'auditId', 'errorType', 'name', 'code', 'points', 'notes', 'customPoints', 'payable', 'nonPayable'].includes(key)) {
                                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return <p key={key}><span className="font-medium text-slate-500 dark:text-slate-400">{formattedKey}:</span> {String(value)}</p>;
                              }
                              return null;
                            })}
                          </div>
                          {error.notes && <p className="text-sm text-slate-700 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 italic dark:text-slate-300">Notes: {error.notes}</p>}
                        </div>
                        <button onClick={() => removeError(error.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors dark:hover:text-red-400 dark:hover:bg-red-900/20">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ... (Aside/Sidebar is unchanged) ... */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 pb-4 border-b border-slate-200 dark:text-white dark:border-slate-700">Audit Details</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1 dark:text-slate-300">User Name *</label>
                    <input type="text" value={userName} disabled className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300" />
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1 dark:text-slate-300">Audit Date</label>
                    <input type="date" value={auditDate} disabled className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:[color-scheme:dark]" />
                </div>
            </div>
            
            {errors.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 dark:text-white">Finalize & Export</h2>
                <button onClick={generateReport} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ease-in-out transform hover:scale-105">
                  <Download size={20} /> Download Excel Report
                </button>
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
};

export default AuditWorkspace;