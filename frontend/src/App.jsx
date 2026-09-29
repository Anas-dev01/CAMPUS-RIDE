import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://sopvxqbqtkyohntbiacz.supabase.co', 'sb_publishable_BuZnBVjaApsDADr_1DLyGQ_A0NrTmao');

const RouteArrow = ({ className = '' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

// --- CUSTOM STATUS MODAL ---
const StatusModal = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border-t-8 border-[#F4A300]">
        <div className={`mb-4 flex justify-center ${type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {type === 'error' ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.8 2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.8a2 2 0 00-3.4 0z" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {type === 'error' ? 'Attention' : 'Success'}
        </h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button 
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#591F00] text-white font-bold hover:opacity-90 transition-all"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};

// --- COMMON AUTH COMPONENT ---
const AuthPage = ({ role, title, primaryColor, accentColor }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [plate, setPlate] = useState('');
  const [transportType, setTransportType] = useState('Tricycle'); 
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, msg: '', type: '' });

  const clearFields = () => {
    setEmail(''); setPassword(''); setShowPassword(false); setFullName(''); 
    setFirstName(''); setLastName(''); setMatricNumber('');
    setUsername(''); setPhoneNumber(''); setPlate(''); setTransportType('Tricycle');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const normalizedPhoneNumber = phoneNumber.startsWith('0') ? `+234${phoneNumber.slice(1)}` : phoneNumber;
    const normalizedUsername = username.trim().toLowerCase();
    const driverAuthEmail = `${normalizedUsername}@drivers.campusride.invalid`;
    
    const credentials = role === 'driver'
      ? { email: driverAuthEmail, password }
      : { email, password };

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        ...credentials,
        options: { 
          data: { 
            role, 
            first_name: role === 'student' ? firstName : null,
            last_name: role === 'student' ? lastName : null,
            matric_number: role === 'student' ? matricNumber : null,
            full_name: role === 'student' ? `${firstName} ${lastName}` : fullName, 
            username: role === 'driver' ? normalizedUsername : null,
            phone_number: role === 'driver' ? normalizedPhoneNumber : null,
            contact_email: role === 'driver' ? (email.trim().toLowerCase() || null) : null,
            plate_number: role === 'driver' ? plate : null,
            transport_type: role === 'driver' ? transportType : null 
          } 
        }
      });
      if (error) { setModal({ show: true, msg: error.message, type: 'error' }); clearFields(); setLoading(false); }
      else { setModal({ show: true, msg: "Sign up successful!", type: 'success' }); clearFields(); setIsSignUp(false); setLoading(false); }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) { setModal({ show: true, msg: error.message, type: 'error' }); clearFields(); setLoading(false); }
      else {
        if (data.user?.user_metadata?.role !== role) {
          await supabase.auth.signOut();
          setModal({ show: true, msg: `Access Denied: This is the ${role} portal.`, type: 'error' });
          clearFields(); setLoading(false);
        } else { window.location.reload(); }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: primaryColor }}>
      <StatusModal message={modal.msg} type={modal.type} onClose={() => setModal({ show: false, msg: '', type: '' })} />
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8" style={{ borderColor: accentColor }}>
        <div className="text-center mb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">CUSTECH</h2>
          <h1 className="text-2xl font-black uppercase" style={{ color: primaryColor }}>{title}</h1>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && role === 'student' && (
            <>
              <div className="flex gap-2">
                <input type="text" placeholder="First Name" className="w-1/2 p-3 border rounded-xl outline-none" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <input type="text" placeholder="Last Name" className="w-1/2 p-3 border rounded-xl outline-none" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <input type="text" placeholder="Matric Number" className="w-full p-3 border rounded-xl outline-none" value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} required />
            </>
          )}

          {isSignUp && role === 'driver' && (
            <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-xl outline-none" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          )}

          {role === 'driver' ? (
            <>
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full p-3 border rounded-xl outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
                  autoComplete="username"
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9][a-zA-Z0-9_.-]{2,29}"
                  title="Use 3-30 letters, numbers, dots, underscores, or hyphens."
                  required
                />
              )}
              {isSignUp && (
                <input
                  type="email"
                  placeholder="Email Address (Optional)"
                  className="w-full p-3 border rounded-xl outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              )}
              {isSignUp && (
                <input
                  type="tel"
                  placeholder="Phone Number (e.g. 08012345678)"
                  className="w-full p-3 border rounded-xl outline-none"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="^0[7-9][0-9]{9}$"
                  title="Enter an 11-digit Nigerian phone number, for example 08012345678"
                  required
                />
              )}
              {!isSignUp && (
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full p-3 border rounded-xl outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
                  autoComplete="username"
                  required
                />
              )}
            </>
          ) : (
            <input
              type="email"
              placeholder="University Email"
              className="w-full p-3 border rounded-xl outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full p-3 pr-12 border rounded-xl outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((isVisible) => !isVisible)}
              className="absolute inset-y-0 right-0 px-4 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.8 10.8 0 0112 4c5.1 0 9.3 3.2 10 8a10.2 10.2 0 01-4 6.2M6.2 6.2A10.2 10.2 0 002 12c.7 4.8 4.9 8 10 8 1.4 0 2.7-.2 3.9-.7" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          
          {isSignUp && role === 'driver' && (
            <>
              <input type="text" placeholder="Vehicle Plate Number" className="w-full p-3 border rounded-xl bg-orange-50" value={plate} onChange={(e) => setPlate(e.target.value)} required />
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Transport Vehicle Type</label>
                <select 
                  className="w-full p-3 border rounded-xl bg-orange-50 outline-none font-bold text-gray-700"
                  value={transportType}
                  onChange={(e) => setTransportType(e.target.value)}
                  required
                >
                  <option value="Tricycle">Tricycle (Max 5 Seats)</option>
                  <option value="Bus">Bus (Max 8 Seats)</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="w-full text-white py-4 rounded-xl font-bold transition-all" style={{ backgroundColor: primaryColor }}>
            {loading ? "VERIFYING..." : (isSignUp ? 'CREATE ACCOUNT' : 'LOGIN')}
          </button>
        </form>
        <button onClick={() => { setIsSignUp(!isSignUp); clearFields(); }} className="mt-6 w-full text-center text-sm font-semibold text-gray-600 underline">{isSignUp ? 'Login' : 'Create Account'}</button>
      </div>
    </div>
  );
};

// --- DRIVER DASHBOARD ---
const DriverDashboard = ({ user, landmarks }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const vehicleType = user.user_metadata?.transport_type || 'Tricycle';
  const maxSeats = vehicleType === 'Bus' ? 8 : 5;
  
  const [seats, setSeats] = useState(maxSeats);
  const [bookedCount, setBookedCount] = useState(0); 
  const [completedCount, setCompletedCount] = useState(0);
  const [activePassengers, setActivePassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, msg: '', type: '' });
  const [showSummary, setShowSummary] = useState(false);

  const driverName = user.user_metadata?.full_name || "Driver";

  const downloadReport = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trip_logs')
      .select('*')
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      setModal({ show: true, msg: "Your activity log is currently empty.", type: 'error' });
      setLoading(false);
      return;
    }

    let csvContent = "S/N,Student Name,Matric Number,From,To,Date,Time\n";
    data.forEach((log, index) => {
      const dateObj = new Date(log.created_at);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      csvContent += `${index + 1},${log.student_name},${log.student_matric},${log.origin},${log.destination},${date},${time}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CUSTECH_Activity_Log_${driverName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLoading(false);
  };

  const fetchActivePassengers = async () => {
    const { data: sessionData } = await supabase
      .from('active_sessions')
      .select('booked_students')
      .eq('id', user.id)
      .single();

    const currentBookedIDs = sessionData?.booked_students || [];

    if (currentBookedIDs.length === 0) {
      setActivePassengers([]);
      return;
    }

    const { data } = await supabase
      .from('trip_logs')
      .select('student_name, student_matric')
      .eq('driver_id', user.id)
      .eq('origin', pickup)
      .eq('destination', destination)
      .order('created_at', { ascending: false })
      .limit(currentBookedIDs.length); 

    setActivePassengers(data || []);
  };

  useEffect(() => {
    if (!isOnline) return;
    fetchActivePassengers();

    const channel = supabase.channel(`driver-sync-${user.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'active_sessions', filter: `id=eq.${user.id}` }, 
    (payload) => {
      const dbSeats = payload.new.available_seats;
      const completed = payload.new.completed_students?.length || 0;
      
      if (dbSeats < seats) {
        setModal({ show: true, msg: `PASSENGER JOINED! A seat has been reserved in your ${vehicleType}.`, type: 'success' });
        setBookedCount(maxSeats - dbSeats);
        fetchActivePassengers();
      }
      setSeats(dbSeats);
      setCompletedCount(completed);
    }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [isOnline, user.id, seats, vehicleType, maxSeats, pickup, destination]);

  const updateSession = async (onlineStatus, currentSeats) => {
    if (onlineStatus && (!pickup || !destination)) return setModal({ show: true, msg: "Set Pickup AND Destination!", type: 'error' });
    if (pickup === destination) return setModal({ show: true, msg: "Pickup and Destination cannot be the same!", type: 'error' });
    
    setLoading(true);
    const { error } = await supabase.from('active_sessions').upsert({
      id: user.id, 
      full_name: driverName, 
      plate_number: user.user_metadata.plate_number,
      transport_type: vehicleType,
      current_landmark: pickup, 
      destination_landmark: destination, 
      available_seats: currentSeats, 
      is_online: onlineStatus, 
      booked_students: onlineStatus ? undefined : [], 
      completed_students: onlineStatus ? undefined : [], 
      last_ping: new Date()
    });
    setLoading(false);
    if (error) {
      setModal({ show: true, msg: error.message, type: 'error' });
    } else {
      setIsOnline(onlineStatus);
      if (onlineStatus) {
        setBookedCount(0);
        setCompletedCount(0);
        setActivePassengers([]);
      }
    }
  };

  const handleModalClose = () => {
    if (seats === 0) setShowSummary(true);
    setModal({ show: false, msg: '', type: '' });
  };

  const maxAllowable = maxSeats - bookedCount;
  const isLocked = bookedCount > completedCount;

  if (isOnline && showSummary) {
    return (
      <div className="p-6 max-w-md mx-auto animate-in fade-in zoom-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#591F00] overflow-hidden">
          <div className="bg-[#591F00] p-5 text-center">
            <h2 className="text-white font-black uppercase tracking-widest">Trip Summary</h2>
            <p className="text-orange-400 text-[10px] font-bold uppercase">Ready for Departure</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Vehicle Details</p>
              <h3 className="text-xl font-black text-gray-800">{vehicleType} - {user.user_metadata?.plate_number}</h3>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 border border-dashed border-gray-300">
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Driver Coming From</p>
                  <p className="font-bold text-sm text-[#591F00]">{pickup}</p>
                </div>
                <RouteArrow className="h-5 w-5 shrink-0 text-orange-500" />
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Dropping At</p>
                  <p className="font-bold text-sm text-[#591F00]">{destination}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 text-center">
                <p className="text-[10px] font-black text-gray-600 uppercase">Booked Seats: {maxSeats}/{maxSeats}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Verified Passengers List:</p>
              <div className="bg-orange-50/60 rounded-xl p-3 border border-orange-100 divide-y divide-orange-200 max-h-44 overflow-y-auto space-y-2">
                {activePassengers.length > 0 ? (
                  activePassengers.map((p, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center text-xs">
                      <div className="text-left">
                        <p className="font-bold text-gray-800 uppercase">{p.student_name}</p>
                        <p className="text-[10px] font-mono text-gray-500">{p.student_matric}</p>
                      </div>
                      <span className="bg-[#591F00] text-white px-2 py-0.5 rounded font-black text-[9px] tracking-wide">BOOKED</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-gray-400 italic">Waiting for digital boarding confirmations...</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-center text-orange-500 uppercase">
                Status: {completedCount} / {bookedCount} Passengers Disembarked
              </p>
              
              <button 
                disabled={isLocked}
                onClick={() => {
                  setShowSummary(false);
                  setBookedCount(0);
                  setCompletedCount(0);
                  setActivePassengers([]);
                  updateSession(false, maxSeats);
                }} 
                className={`w-full py-4 rounded-2xl font-black transition-all uppercase tracking-tighter ${isLocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white shadow-lg hover:bg-green-700'}`}
              >
                {isLocked ? "Waiting for Passenger Complete Tokens..." : "FINISH TRIP & RESET"}
              </button>

              {isLocked && (
                <button 
                  onDoubleClick={() => {
                    setShowSummary(false);
                    setBookedCount(0);
                    setCompletedCount(0);
                    setActivePassengers([]);
                    updateSession(false, maxSeats);
                  }}
                  className="w-full py-2 text-[10px] text-red-500 font-bold underline text-center"
                >
                  FORCE RESET (Double Click to override dead student device)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <StatusModal message={modal.msg} type={modal.type} onClose={handleModalClose} />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Active Driver,</p>
          <h2 className="text-2xl font-black text-gray-800 uppercase">{driverName}</h2>
        </div>
        <button 
          onClick={downloadReport}
          disabled={loading}
          className="bg-gray-100 p-2 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-200 transition-all"
        >
          {loading ? "..." : "📥 LOGS"}
        </button>
      </div>

      <div className="text-center mb-4 bg-orange-50 p-3 rounded-2xl">
         <h2 className="text-sm font-bold text-gray-700 uppercase">{vehicleType} Management</h2>
         <p className="text-[10px] font-bold text-orange-500">MAX CAPACITY: {maxSeats} SEATS</p>
         {bookedCount > 0 && <p className="text-[10px] text-red-500 font-bold uppercase">{bookedCount} SEAT(S) ALREADY RESERVED</p>}
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Current Location (Pickup Point)</label>
          <select className="w-full p-3 mt-1 border rounded-xl bg-gray-50 font-bold" onChange={(e) => setPickup(e.target.value)} disabled={isOnline}>
            <option value="">Select Pickup...</option>
            {landmarks.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase">Heading To (Destination)</label>
          <select className="w-full p-3 mt-1 border rounded-xl bg-gray-50 font-bold text-[#591F00]" onChange={(e) => setDestination(e.target.value)} disabled={isOnline}>
            <option value="">Select Destination...</option>
            {landmarks.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg text-center mb-8 border border-gray-100">
        <p className="text-gray-500 text-xs mb-2 uppercase font-bold">Available Seats</p>
        <div className="flex items-center justify-center gap-6">
          <button onClick={() => {
            const nextVal = Math.max(0, seats - 1);
            setSeats(nextVal); 
            if(isOnline) updateSession(true, nextVal);
          }} className="w-12 h-12 rounded-full bg-gray-100 text-2xl font-bold">-</button>
          
          <span className="text-5xl font-black text-[#591F00]">{seats}</span>
          
          <button 
            disabled={seats >= maxAllowable}
            onClick={() => {
              const nextVal = Math.min(maxAllowable, seats + 1);
              setSeats(nextVal); 
              if(isOnline) updateSession(true, nextVal);
            }} 
            className={`w-12 h-12 rounded-full text-2xl font-bold ${seats >= maxAllowable ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-black'}`}
          >
            +
          </button>
        </div>
        {seats >= maxAllowable && bookedCount > 0 && (
          <p className="text-[9px] text-red-400 mt-2 font-bold uppercase">Reserved seats cannot be reopened manually</p>
        )}
      </div>

      {isOnline && (
        <button 
          onClick={() => setShowSummary(true)}
          className="w-full mb-3 py-3 rounded-xl border-2 border-[#591F00] text-[#591F00] font-black text-xs uppercase"
        >
          📋 View Passenger Manifest ({maxSeats - seats}/{maxSeats})
        </button>
      )}
      
      <button onClick={() => updateSession(!isOnline, seats)} disabled={loading} className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl ${isOnline ? 'bg-red-500 text-white' : 'bg-[#F4A300] text-black'}`}>
        {loading ? "..." : (isOnline ? 'END LIVE' : 'GO LIVE')}
      </button>
    </div>
  );
};

// --- STUDENT DASHBOARD ---
const StudentDashboard = ({ user, landmarks }) => {
  const [myDestination, setMyDestination] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [joinLoading, setJoinLoading] = useState(null);
  const [modal, setModal] = useState({ show: false, msg: '', type: '' });
  
  const [activeBooking, setActiveBooking] = useState(null);
  const [pendingBooking, setPendingBooking] = useState(null);

  const studentName = user.user_metadata?.first_name || user.user_metadata?.full_name || "Student";

  useEffect(() => {
    const checkExistingBooking = async () => {
      const { data } = await supabase
        .from('active_sessions')
        .select('*')
        .contains('booked_students', [user.id])
        .eq('is_online', true)
        .limit(1)
        .maybeSingle();

      if (data) {
        const isCompletedByMe = data.completed_students?.includes(user.id);
        if (!isCompletedByMe) {
          setActiveBooking({ ...data, reservationTime: "Active Token" });
        }
      }
    };
    checkExistingBooking();
  }, [user.id]);

  useEffect(() => {
    if (!myDestination || activeBooking) return;
    const fetchDrivers = async () => {
      const { data } = await supabase.from('active_sessions')
        .select('*')
        .eq('destination_landmark', myDestination)
        .eq('is_online', true)
        .gt('available_seats', 0);
      setAvailableDrivers(data || []);
    };
    fetchDrivers();
    const channel = supabase.channel('db-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'active_sessions' }, () => fetchDrivers()).subscribe();
    return () => supabase.removeChannel(channel);
  }, [myDestination, activeBooking]);

  const handleJoinRide = async (driver) => {
    if (driver.available_seats <= 0) return setModal({ show: true, msg: "No space left!", type: 'error' });
    if (driver.booked_students && driver.booked_students.includes(user.id)) {
        return setModal({ show: true, msg: "You have already reserved a seat in this ride!", type: 'error' });
    }
    
    setJoinLoading(driver.id);

    const { error: logError } = await supabase.from('trip_logs').insert({
      driver_id: driver.id,
      driver_name: driver.full_name,
      student_name: `${user.user_metadata.first_name} ${user.user_metadata.last_name}` || user.user_metadata.full_name,
      student_matric: user.user_metadata.matric_number,
      origin: driver.current_landmark,
      destination: driver.destination_landmark,
      vehicle_plate: driver.plate_number
    });

    if (logError) {
      setJoinLoading(null);
      return setModal({ show: true, msg: "Logging failed: " + logError.message, type: 'error' });
    }

    const updatedBookedList = driver.booked_students ? [...driver.booked_students, user.id] : [user.id];
    const { error } = await supabase.from('active_sessions')
      .update({ 
        available_seats: driver.available_seats - 1,
        booked_students: updatedBookedList
      })
      .eq('id', driver.id);
    
    setJoinLoading(null);
    if (error) {
      setModal({ show: true, msg: error.message, type: 'error' });
    } else {
      const reservationTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setPendingBooking({ ...driver, reservationTime });
      setModal({ show: true, msg: `Seat Reserved in ${driver.transport_type}! Please present your card to the driver.`, type: 'success' });
    }
  };

  const handleModalClose = () => {
    if (pendingBooking) {
      setActiveBooking(pendingBooking);
      setPendingBooking(null);
    }
    setModal({ show: false, msg: '', type: '' });
  };

  const handleCompleteTrip = async () => {
    if (!activeBooking) return;
    
    const { data: currentSession } = await supabase
      .from('active_sessions')
      .select('completed_students')
      .eq('id', activeBooking.id)
      .single();

    const currentList = currentSession?.completed_students || [];
    if (!currentList.includes(user.id)) {
      const updatedList = [...currentList, user.id];
      await supabase
        .from('active_sessions')
        .update({ completed_students: updatedList })
        .eq('id', activeBooking.id);
    }

    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!myDestination) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="mb-6">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Welcome back,</p>
          <h2 className="text-2xl font-black text-[#591F00] uppercase">{studentName}</h2>
        </div>

        <h2 className="text-sm font-bold mb-4 text-gray-500 uppercase">Where are you?</h2>
        <div className="grid grid-cols-1 gap-3">
          {landmarks.map(l => (
            <button key={l.id} onClick={() => setMyDestination(l.name)} className="p-4 border border-gray-200 rounded-xl text-left bg-white shadow-sm font-bold text-gray-700 hover:border-[#F4A300] transition-all">
              {l.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeBooking && !modal.show) {
    return (
      <div className="p-6 max-w-md mx-auto animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#F4A300] overflow-hidden">
          <div className="bg-[#F4A300] p-4 text-center">
            <p className="font-black text-sm uppercase tracking-tighter">Trip Reservation</p>
          </div>
          <div className="p-6 text-center space-y-4">
            <div>
               <p className="text-orange-500 text-[11px] font-black uppercase mb-1">Status: Active Booking Pass</p>
            </div>
            
            <div className="bg-orange-50/50 p-4 rounded-2xl border border-dashed border-orange-300 text-center">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Digital Boarding Token</p>
              <h4 className="text-lg font-black text-gray-800 uppercase">{user.user_metadata?.full_name || studentName}</h4>
              <p className="text-sm font-mono font-bold text-[#591F00]">{user.user_metadata?.matric_number}</p>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Your Driver</p>
              <h3 className="text-2xl font-black text-gray-800">{activeBooking.full_name}</h3>
              <p className="text-sm font-bold text-[#591F00]">{activeBooking.plate_number}</p>
            </div>
            
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl mb-6">
              <div className="text-left w-1/2">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Driver Location</p>
                <p className="font-bold text-xs text-gray-700">{activeBooking.current_landmark}</p>
              </div>
              <RouteArrow className="h-5 w-5 shrink-0 text-orange-400" />
              <div className="text-right w-1/2">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Dropping At</p>
                <p className="font-bold text-xs text-gray-700">{activeBooking.destination_landmark}</p>
              </div>
            </div>

            <button 
              onClick={handleCompleteTrip}
              className="w-full py-4 rounded-xl bg-[#591F00] text-white font-bold shadow-lg active:scale-95 transition-transform"
            >
              CONFIRM RIDE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <StatusModal message={modal.msg} type={modal.type} onClose={handleModalClose} />
      <button onClick={() => setMyDestination(null)} className="mb-4 text-[#591F00] font-bold text-sm underline flex items-center gap-1">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m6 6-6-6 6-6" />
        </svg>
        Change Destination
      </button>
      <div className="bg-[#591F00]/5 p-4 rounded-xl mb-6 border-l-4 border-[#591F00]">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{studentName}, here are driver(s) heading to {myDestination}:</p>
      </div>
      <div className="space-y-3">
        {availableDrivers.length > 0 ? (
          availableDrivers.map(d => (
            <div key={d.id} className="p-4 bg-white shadow-md border border-gray-100 rounded-2xl flex justify-between items-center animate-in slide-in-from-bottom-2">
              <div className="w-2/3">
                <div className="flex items-center gap-2">
                   <p className="font-bold text-gray-800">{d.full_name}</p>
                   <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-black uppercase">{d.transport_type}</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">From: {d.current_landmark}</p>
                <p className="text-xs text-orange-500 font-bold mt-1">{d.available_seats} seats left</p>
              </div>
              <button 
                onClick={() => handleJoinRide(d)}
                disabled={joinLoading === d.id}
                className="bg-[#F4A300] text-black px-5 py-2 rounded-xl text-xs font-black shadow-sm"
              >
                {joinLoading === d.id ? "..." : "JOIN"}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400 italic">No drivers heading to {myDestination} yet...</div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [user, setUser] = useState(null);
  const [landmarks, setLandmarks] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const getLandmarks = async () => {
      const { data } = await supabase.from('landmarks').select('*');
      setLandmarks(data || []);
    };
    getLandmarks();
  }, []);

  if (user) {
    const role = user.user_metadata?.role;
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="p-4 bg-[#591F00] text-white flex justify-between items-center shadow-md border-b-4 border-[#F4A300]">
          <h1 className="font-bold tracking-tighter italic">CUSTECH RIDE</h1>
          <button 
            onClick={async () => { 
              await supabase.auth.signOut(); 
              localStorage.clear(); 
              sessionStorage.clear();
              window.location.reload(); 
            }} 
            className="text-[10px] border border-white/30 px-3 py-1 rounded-lg font-bold"
          >
            LOGOUT
          </button>
        </header>
        <main>{role === 'driver' ? <DriverDashboard user={user} landmarks={landmarks} /> : <StudentDashboard user={user} landmarks={landmarks} />}</main>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage role="student" title="STUDENT PORTAL" primaryColor="#591F00" accentColor="#F4A300" />} />
        <Route path="/driver-auth" element={<AuthPage role="driver" title="DRIVER PORTAL" primaryColor="#111827" accentColor="#F4A300" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;