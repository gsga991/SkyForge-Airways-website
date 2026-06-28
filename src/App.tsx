import { useMemo, useState, useEffect } from 'react';

type Role = 'admin' | 'passenger';

type User = {
  username: string;
  password: string;
  role: Role;
};

type Flight = {
  id: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  price: number;
  seats: number;
};

type Booking = {
  flightId: string;
  passenger: string;
  seats: number;
};

type CargoBooking = {
  id: string;
  shipper: string;
  email: string;
  origin: string;
  destination: string;
  aircraft: '747 Cargo' | '777X Cargo' | 'Beluga XL';
  weight: number;
  contents: string;
  date: string;
  status: 'Pending' | 'Scheduled';
};

type CharterBooking = {
  id: string;
  booker: string;
  email: string;
  origin: string;
  destination: string;
  aircraft: 'Citation CJ4' | 'Vitation X' | '737 BBJ';
  passengers: number;
  date: string;
  notes: string;
  status: 'Pending' | 'Confirmed';
};

const STORAGE_KEYS = {
  users: 'sfa_users_v1',
  flights: 'sfa_flights_v1',
  bookings: 'sfa_bookings_v1',
  cargo: 'sfa_cargo_v1',
  charters: 'sfa_charters_v1',
};

const defaultUsers: User[] = [];
const defaultFlights: Flight[] = [];

const App = () => {
  const bgImages = [
    // Landscapes curated for travel look: beach, mountains, city skyline, desert
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1950&h=1300&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1950&h=1300&q=80',
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1950&h=1300&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1950&h=1300&q=80'
  ];
  const [bgIndex, setBgIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setBgIndex((i) => (i + 1) % bgImages.length), 7000);
    return () => clearInterval(t);
  }, [bgImages.length]);
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.users);
      return raw ? JSON.parse(raw) : defaultUsers;
    } catch {
      return defaultUsers;
    }
  });

  // If there are no users stored, attempt to read initial admin creds from /admin.txt
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.users);
      if (!raw) {
        fetch('/admin.txt')
          .then((res) => {
            if (!res.ok) return null;
            return res.text();
          })
          .then((text) => {
            if (!text) return;
            const [u, p] = text.trim().split(':');
            if (!u || !p) return;
            setUsers([{ username: u, password: p, role: 'admin' }]);
          })
          .catch(() => {});
      }
    } catch (e) {
      // ignore
    }
  }, []);
  const [flights, setFlights] = useState<Flight[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.flights);
      return raw ? JSON.parse(raw) : defaultFlights;
    } catch {
      return defaultFlights;
    }
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.bookings);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [cargoBookings, setCargoBookings] = useState<CargoBooking[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.cargo);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [charterBookings, setCharterBookings] = useState<CharterBooking[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.charters);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<'auth' | 'adminLogin' | 'cargo' | 'charter' | 'user' | 'admin'>('auth');
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupPhase, setSignupPhase] = useState<'form' | 'verify'>('form');
  const [signupVerificationCode, setSignupVerificationCode] = useState('');
  const [enteredVerificationCode, setEnteredVerificationCode] = useState('');
  const [pendingSignup, setPendingSignup] = useState<{ email: string; password: string } | null>(null);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [selectedFlightId, setSelectedFlightId] = useState('');
  const [cargoOrigin, setCargoOrigin] = useState('');
  const [cargoDestination, setCargoDestination] = useState('');
  const [cargoAircraft, setCargoAircraft] = useState<'747 Cargo' | '777X Cargo' | 'Beluga XL'>('747 Cargo');
  const [cargoWeight, setCargoWeight] = useState(0);
  const [cargoContents, setCargoContents] = useState('');
  const [cargoDate, setCargoDate] = useState('');
  const [cargoEmail, setCargoEmail] = useState('');
  const [charterOrigin, setCharterOrigin] = useState('');
  const [charterDestination, setCharterDestination] = useState('');
  const [charterAircraft, setCharterAircraft] = useState<'Citation CJ4' | 'Vitation X' | '737 BBJ'>('Citation CJ4');
  const [charterPassengers, setCharterPassengers] = useState(2);
  const [charterDate, setCharterDate] = useState('');
  const [charterNotes, setCharterNotes] = useState('');
  const [charterEmail, setCharterEmail] = useState('');
  const [requestedSeats, setRequestedSeats] = useState(1);
  const [newFlight, setNewFlight] = useState({ id: '', from: '', to: '', depart: '', arrive: '', price: 0, seats: 0 });
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [message, setMessage] = useState('');

  const bookingSummary = useMemo(
    () =>
      bookings.map((booking) => {
        const flight = flights.find((f) => f.id === booking.flightId);
        return flight
          ? `${booking.passenger} booked ${booking.seats} seat(s) on ${flight.from} → ${flight.to} (${flight.id})`
          : `${booking.passenger} booked on an unknown flight`;
      }),
    [bookings, flights]
  );

  const loginUser = () => {
    const user = users.find((u) => u.username === loginEmail && u.password === loginPassword);
    if (!user) {
      setMessage('Invalid email or password.');
      return;
    }
    if (user.role !== 'passenger') {
      setMessage('Please use the administrator login link for admin access.');
      return;
    }
    setCurrentUser(user);
    setScreen('user');
    setMessage(`Welcome, ${user.username}.`);
    setLoginPassword('');
  };

  const signupUser = () => {
    if (!signupEmail || !signupPassword) {
      setMessage('Email and password are required.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setMessage('Passwords do not match.');
      return;
    }
    if (users.some((user) => user.username === signupEmail)) {
      setMessage('That email is already registered.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSignupVerificationCode(code);
    setPendingSignup({ email: signupEmail, password: signupPassword });
    setSignupPhase('verify');
    setMessage(`A verification code was sent to ${signupEmail}. Enter it to complete registration.`);
  };

  const confirmSignupCode = () => {
    if (!pendingSignup) {
      setMessage('Please start a new signup process.');
      return;
    }
    if (enteredVerificationCode !== signupVerificationCode) {
      setMessage('The verification code is incorrect.');
      return;
    }
    const nextUser: User = { username: pendingSignup.email, password: pendingSignup.password, role: 'passenger' };
    setUsers((current) => [...current, nextUser]);
    setCurrentUser(nextUser);
    setScreen('user');
    setMessage(`Account created. Welcome, ${pendingSignup.email}.`);
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirm('');
    setEnteredVerificationCode('');
    setPendingSignup(null);
    setSignupPhase('form');
    setSignupVerificationCode('');
  };

  const loginAdmin = () => {
    const user = users.find((u) => u.username === adminUsername && u.password === adminPassword && u.role === 'admin');
    if (!user) {
      setMessage('Admin credentials are incorrect.');
      return;
    }
    setCurrentUser(user);
    setScreen('admin');
    setMessage('Administrator access granted.');
    setAdminPassword('');
  };

  const logout = () => {
    setCurrentUser(null);
    setMessage('Logged out successfully.');
    setScreen('auth');
    setSelectedFlightId('');
  };

  const selectedFlight = flights.find((flight) => flight.id === selectedFlightId);

  const bookFlight = () => {
    if (!currentUser || currentUser.role !== 'passenger') {
      setMessage('You must be logged in as a passenger to book.');
      return;
    }
    if (!selectedFlight) {
      setMessage('Select a flight before booking.');
      return;
    }
    if (requestedSeats < 1) {
      setMessage('Choose at least one seat.');
      return;
    }
    if (selectedFlight.seats < requestedSeats) {
      setMessage(`Only ${selectedFlight.seats} seats are available on ${selectedFlight.id}.`);
      return;
    }
    setFlights((current) =>
      current.map((flight) =>
        flight.id === selectedFlight.id ? { ...flight, seats: flight.seats - requestedSeats } : flight
      )
    );
    setBookings((current) => [...current, { flightId: selectedFlight.id, passenger: currentUser.username, seats: requestedSeats }]);
    setMessage(`Booked ${requestedSeats} seat(s) on ${selectedFlight.id}.`);
    setRequestedSeats(1);
  };

  const bookCargo = () => {
    const shipperEmail = currentUser?.role === 'passenger' ? currentUser.username : cargoEmail;
    if (!shipperEmail) {
      setMessage('Provide an email to book cargo.');
      return;
    }
    if (!cargoOrigin || !cargoDestination || !cargoAircraft || cargoWeight <= 0 || !cargoContents || !cargoDate) {
      setMessage('All cargo booking fields are required.');
      return;
    }
    const nextCargo: CargoBooking = {
      id: `CG${Date.now()}`,
      shipper: currentUser?.role === 'passenger' ? currentUser.username : cargoEmail,
      email: shipperEmail,
      origin: cargoOrigin,
      destination: cargoDestination,
      aircraft: cargoAircraft,
      weight: cargoWeight,
      contents: cargoContents,
      date: cargoDate,
      status: 'Pending',
    };
    setCargoBookings((current) => [...current, nextCargo]);
    setMessage(`Cargo shipment booked on ${cargoAircraft} from ${cargoOrigin} to ${cargoDestination}.`);
    setCargoOrigin('');
    setCargoDestination('');
    setCargoAircraft('747 Cargo');
    setCargoWeight(0);
    setCargoContents('');
    setCargoDate('');
    setCargoEmail('');
  };

  const bookCharter = () => {
    const contactEmail = currentUser?.role === 'passenger' ? currentUser.username : charterEmail;
    if (!contactEmail) {
      setMessage('Provide an email to book a charter.');
      return;
    }
    if (!charterOrigin || !charterDestination || !charterAircraft || charterPassengers < 1 || !charterDate) {
      setMessage('All charter booking fields are required.');
      return;
    }
    const nextCharter: CharterBooking = {
      id: `CH${Date.now()}`,
      booker: currentUser?.role === 'passenger' ? currentUser.username : charterEmail,
      email: contactEmail,
      origin: charterOrigin,
      destination: charterDestination,
      aircraft: charterAircraft,
      passengers: charterPassengers,
      date: charterDate,
      notes: charterNotes,
      status: 'Pending',
    };
    setCharterBookings((current) => [...current, nextCharter]);
    setMessage(`Private charter booked on ${charterAircraft} from ${charterOrigin} to ${charterDestination}.`);
    setCharterOrigin('');
    setCharterDestination('');
    setCharterAircraft('Citation CJ4');
    setCharterPassengers(2);
    setCharterDate('');
    setCharterNotes('');
    setCharterEmail('');
  };

  const addFlight = () => {
    if (!newFlight.id || !newFlight.from || !newFlight.to || !newFlight.depart || !newFlight.arrive || newFlight.price <= 0 || newFlight.seats <= 0) {
      setMessage('All flight fields are required.');
      return;
    }
    if (flights.some((flight) => flight.id === newFlight.id)) {
      setMessage('That flight ID already exists.');
      return;
    }
    setFlights((current) => [...current, { ...newFlight }]);
    setMessage(`Flight ${newFlight.id} added.`);
    setNewFlight({ id: '', from: '', to: '', depart: '', arrive: '', price: 0, seats: 0 });
  };

  const deleteFlight = (id: string) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
    setMessage(`Flight ${id} removed.`);
    if (selectedFlightId === id) setSelectedFlightId('');
  };

  const removePassenger = (username: string) => {
    setUsers((current) => current.filter((user) => user.username !== username));
    setMessage(`Passenger ${username} removed.`);
    setBookings((current) => current.filter((booking) => booking.passenger !== username));
  };

  const changeAdminPassword = () => {
    if (!newAdminPassword) {
      setMessage('Enter a new admin password.');
      return;
    }
    setUsers((current) =>
      current.map((user) =>
        user.role === 'admin' ? { ...user, password: newAdminPassword } : user
      )
    );
    setMessage('Admin password updated.');
    setNewAdminPassword('');
  };

  const changeAdminCredentials = () => {
    if (!newAdminUsername && !newAdminPassword) {
      setMessage('Enter a new admin username or password.');
      return;
    }
    setUsers((current) =>
      current.map((user) =>
        user.role === 'admin'
          ? {
              ...user,
              username: newAdminUsername || user.username,
              password: newAdminPassword || user.password,
            }
          : user
      )
    );
    setMessage('Admin credentials updated.');
    setNewAdminPassword('');
    setNewAdminUsername('');
  };

  const exportLogins = () => {
    const loginText = users
      .map((user) => `${user.username}:${user.password}:${user.role}`)
      .join('\n');
    const blob = new Blob([loginText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'logins.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage('Login export prepared. Check your browser downloads.');
  };

  // persist data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.flights, JSON.stringify(flights));
      localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
      localStorage.setItem(STORAGE_KEYS.cargo, JSON.stringify(cargoBookings));
      localStorage.setItem(STORAGE_KEYS.charters, JSON.stringify(charterBookings));
    } catch (e) {
      // ignore storage errors
    }
  }, [users, flights, bookings, cargoBookings, charterBookings]);

  const passengerAccounts = users.filter((user) => user.role === 'passenger');
  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <div className="bg-slideshow" aria-hidden="true">
        {bgImages.map((src, idx) => (
          <div
            key={src}
            className={`bg-image ${idx === bgIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>

      <div className="app-shell content-wrapper">
        <div className="content-card">
          <div className="layout">
            <header className="topbar app-header">
              <div className="brand-block">
                <img src="/logo.png" alt="SkyForge Airways logo" className="brand-logo" />
                <div>
                  <div className="brand-name">SkyForge Airways</div>
                  <div className="brand-tag">Premium carrier experience</div>
                </div>
              </div>

              <nav className="header-nav" aria-label="Main navigation">
                <button className="link-button" onClick={() => { setScreen('auth'); }}>Home</button>
                <button className="link-button" onClick={() => { setScreen(currentUser ? 'user' : 'auth'); }}>Book</button>
                <button className="link-button" onClick={() => { setScreen('cargo'); }}>Cargo</button>
                <button className="link-button" onClick={() => { setScreen('charter'); }}>Charter</button>
                <button className="link-button" onClick={() => { if (currentUser) setScreen('user'); else setScreen('auth'); }}>My Account</button>
              </nav>

              <div className="header-actions">
                {currentUser ? (
                  <button className="top-action" onClick={logout}>Sign out</button>
                ) : (
                  <button className="top-action" onClick={() => { setScreen('adminLogin'); setMessage(''); }}>Admin login</button>
                )}
              </div>
            </header>

            <div className="main">
              {message && <div className="message-banner">{message}</div>}

      {screen === 'auth' && !currentUser && (
        <main className="hero-grid">
          <section className="hero-panel">
            <div className="hero-badge">Executive travel platform</div>
            <h1>SkyForge Airways — premium travel operations built for enterprise.</h1>
            <p>Book curated premium routes, manage executive passenger accounts, and control operations through an elevated airline portal with a refined business-class experience.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setAuthTab('login')}>Log in</button>
              <button className="secondary-button" onClick={() => setAuthTab('signup')}>Create account</button>
            </div>
          </section>

          <section className="auth-panel">
            <div className="auth-tabs">
              <button className={authTab === 'login' ? 'tab active' : 'tab'} onClick={() => {
                setAuthTab('login');
                setSignupPhase('form');
                setPendingSignup(null);
                setSignupVerificationCode('');
                setEnteredVerificationCode('');
              }}>Passenger login</button>
              <button className={authTab === 'signup' ? 'tab active' : 'tab'} onClick={() => {
                setAuthTab('signup');
                setSignupPhase('form');
                setPendingSignup(null);
                setSignupVerificationCode('');
                setEnteredVerificationCode('');
              }}>New account</button>
            </div>

            {authTab === 'login' ? (
              <div className="auth-form">
                <label>
                  Email
                  <input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="e.g. traveler@example.com" />
                </label>
                <label>
                  Password
                  <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="Your password" />
                </label>
                <button className="primary-button" onClick={loginUser}>Sign in</button>
              </div>
            ) : (
              <div className="auth-form">
                {signupPhase === 'form' ? (
                  <>
                    <label>
                      Email
                      <input value={signupEmail} onChange={(event) => setSignupEmail(event.target.value)} placeholder="name@company.com" />
                    </label>
                    <label>
                      Password
                      <input type="password" value={signupPassword} onChange={(event) => setSignupPassword(event.target.value)} placeholder="Enter a password" />
                    </label>
                    <label>
                      Confirm password
                      <input type="password" value={signupConfirm} onChange={(event) => setSignupConfirm(event.target.value)} placeholder="Repeat password" />
                    </label>
                    <button className="primary-button" onClick={signupUser}>Create account</button>
                  </>
                ) : (
                  <>
                    <div className="info-card" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <p>A one-time verification code has been emailed to <strong>{pendingSignup?.email}</strong>. Enter it below to confirm your account.</p>
                      <p style={{ color: 'rgba(248,250,252,0.72)', marginTop: '8px' }}><strong>Demo note:</strong> the code is <span style={{ color: 'var(--accent-gold)' }}>{signupVerificationCode}</span>.</p>
                    </div>
                    <label>
                      Verification code
                      <input value={enteredVerificationCode} onChange={(event) => setEnteredVerificationCode(event.target.value)} placeholder="Enter code" />
                    </label>
                    <button className="primary-button" onClick={confirmSignupCode}>Verify and finish</button>
                    <button className="secondary-button" onClick={() => {
                      setSignupPhase('form');
                      setPendingSignup(null);
                      setSignupVerificationCode('');
                      setEnteredVerificationCode('');
                      setMessage('Signup cancelled. Please start again.');
                    }}>Restart signup</button>
                  </>
                )}
              </div>
            )}
          </section>
        </main>
      )}

      {screen === 'cargo' && (
        <section className="cargo-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Cargo operations</span>
              <h2>Book cargo shipment</h2>
            </div>
          </div>
          <div className="cargo-form">
            {currentUser?.role === 'passenger' ? (
              <div className="info-card">
                Shipping contact email is <strong>{currentUser.username}</strong>.
              </div>
            ) : (
              <label>
                Contact email
                <input value={cargoEmail} onChange={(event) => setCargoEmail(event.target.value)} placeholder="contact@company.com" />
              </label>
            )}
            <label>
              Cargo aircraft
              <select value={cargoAircraft} onChange={(event) => setCargoAircraft(event.target.value as '747 Cargo' | '777X Cargo' | 'Beluga XL')}>
                <option value="747 Cargo">747 Cargo</option>
                <option value="777X Cargo">777X Cargo</option>
                <option value="Beluga XL">Beluga XL</option>
              </select>
            </label>
            <label>
              Origin
              <input value={cargoOrigin} onChange={(event) => setCargoOrigin(event.target.value)} placeholder="Origin airport or hub" />
            </label>
            <label>
              Destination
              <input value={cargoDestination} onChange={(event) => setCargoDestination(event.target.value)} placeholder="Destination airport or hub" />
            </label>
            <label>
              Weight (kg)
              <input type="number" min={1} value={cargoWeight} onChange={(event) => setCargoWeight(Number(event.target.value))} />
            </label>
            <label>
              Cargo description
              <input value={cargoContents} onChange={(event) => setCargoContents(event.target.value)} placeholder="e.g. electronics, perishables" />
            </label>
            <label>
              Shipment date
              <input type="date" value={cargoDate} onChange={(event) => setCargoDate(event.target.value)} />
            </label>
            <button className="primary-button" onClick={bookCargo}>Book cargo</button>
          </div>
          <div className="info-card">
            <h3>Current cargo bookings</h3>
            {cargoBookings.length ? (
              <div className="flights-list">
                {cargoBookings.map((cargo) => (
                  <div key={cargo.id} className="flight-card">
                    <div className="flight-card-top">
                      <span className="flight-code">{cargo.id}</span>
                      <span className="flight-seats">{cargo.status}</span>
                    </div>
                    <div className="flight-route">{cargo.origin} → {cargo.destination}</div>
                    <div className="flight-times">{cargo.date} · {cargo.weight} kg · {cargo.aircraft}</div>
                    <div className="flight-price">{cargo.contents}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No cargo bookings yet.</p>
            )}
          </div>
        </section>
      )}

      {screen === 'charter' && (
        <section className="cargo-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Private charter</span>
              <h2>Book executive charter service</h2>
            </div>
          </div>
          <div className="cargo-form">
            {currentUser?.role === 'passenger' ? (
              <div className="info-card">
                Contact email for this booking is <strong>{currentUser.username}</strong>.
              </div>
            ) : (
              <label>
                Contact email
                <input value={charterEmail} onChange={(event) => setCharterEmail(event.target.value)} placeholder="contact@company.com" />
              </label>
            )}
            <label>
              Charter aircraft
              <select value={charterAircraft} onChange={(event) => setCharterAircraft(event.target.value as 'Citation CJ4' | 'Vitation X' | '737 BBJ')}>
                <option value="Citation CJ4">Citation CJ4</option>
                <option value="Vitation X">Vitation X</option>
                <option value="737 BBJ">737 BBJ</option>
              </select>
            </label>
            <label>
              Origin
              <input value={charterOrigin} onChange={(event) => setCharterOrigin(event.target.value)} placeholder="Origin airport or hub" />
            </label>
            <label>
              Destination
              <input value={charterDestination} onChange={(event) => setCharterDestination(event.target.value)} placeholder="Destination airport or hub" />
            </label>
            <label>
              Passengers
              <input type="number" min={1} value={charterPassengers} onChange={(event) => setCharterPassengers(Number(event.target.value))} />
            </label>
            <label>
              Departure date
              <input type="date" value={charterDate} onChange={(event) => setCharterDate(event.target.value)} />
            </label>
            <label>
              Notes
              <input value={charterNotes} onChange={(event) => setCharterNotes(event.target.value)} placeholder="Special requests, catering, or route details" />
            </label>
            <button className="primary-button" onClick={bookCharter}>Book charter</button>
          </div>
          <div className="info-card">
            <h3>Current charter requests</h3>
            {charterBookings.length ? (
              <div className="flights-list">
                {charterBookings.map((charter) => (
                  <div key={charter.id} className="flight-card">
                    <div className="flight-card-top">
                      <span className="flight-code">{charter.id}</span>
                      <span className="flight-seats">{charter.status}</span>
                    </div>
                    <div className="flight-route">{charter.origin} → {charter.destination}</div>
                    <div className="flight-times">{charter.date} · {charter.passengers} passengers · {charter.aircraft}</div>
                    <div className="flight-price">{charter.notes || 'No special notes.'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No charter bookings yet.</p>
            )}
          </div>
        </section>
      )}

      {screen === 'adminLogin' && !currentUser && (
        <section className="admin-login-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Administrator portal</span>
              <h2>Secure admin sign in</h2>
            </div>
            <button className="link-button" onClick={() => { setScreen('auth'); setMessage(''); }}>Back to passenger login</button>
          </div>
          <div className="admin-login-form">
            <label>
              Admin username
              <input value={adminUsername} onChange={(event) => setAdminUsername(event.target.value)} placeholder="admin" />
            </label>
            <label>
              Admin password
              <input type="password" value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} placeholder="admin" />
            </label>
            <button className="primary-button" onClick={loginAdmin}>Enter admin panel</button>
            <div className="admin-note">Default admin login is <strong>admin</strong> / <strong>admin</strong>. Change it immediately after first sign in.</div>
          </div>
        </section>
      )}

      {screen === 'user' && currentUser && currentUser.role === 'passenger' && (
        <section className="dashboard-grid">
          <div className="welcome-panel">
            <span className="eyebrow">Passenger dashboard</span>
            <h2>Welcome aboard, {currentUser.username}</h2>
            <p>Book your flight, manage bookings, and discover new routes.</p>
          </div>
          <div className="user-actions">
            <div className="info-card">
              <h3>Flights available</h3>
              <p>{flights.length ? `We currently have ${flights.length} flight${flights.length > 1 ? 's' : ''} available.` : 'No flights are available right now. The administrator can add flights from the admin panel.'}</p>
            </div>
            <div className="info-card">
              <h3>Bookings</h3>
              <p>{bookingSummary.length ? `${bookingSummary.length} booking${bookingSummary.length > 1 ? 's' : ''} registered.` : 'You have not booked any flights yet.'}</p>
            </div>
          </div>

          <div className="flights-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Available routes</span>
                <h2>Book your next journey</h2>
              </div>
            </div>
            {flights.length ? (
              <div className="flights-list">
                {flights.map((flight) => (
                  <div key={flight.id} className={`flight-card ${selectedFlightId === flight.id ? 'selected' : ''}`} onClick={() => setSelectedFlightId(flight.id)}>
                    <div className="flight-card-top">
                      <span className="flight-code">{flight.id}</span>
                      <span className="flight-seats">{flight.seats} seats left</span>
                    </div>
                    <div className="flight-route">{flight.from} → {flight.to}</div>
                    <div className="flight-times">Depart {flight.depart} · Arrive {flight.arrive}</div>
                    <div className="flight-price">${flight.price}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No flights are currently scheduled. Check back once the administrator adds routes.</p>
              </div>
            )}
          </div>

          <div className="booking-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Ticket booking</span>
                <h2>Reserve your seat</h2>
              </div>
            </div>
            <div className="booking-form">
              <label>
                Selected flight
                <select value={selectedFlightId} onChange={(event) => setSelectedFlightId(event.target.value)}>
                  <option value="">Choose a flight</option>
                  {flights.map((flight) => (
                    <option key={flight.id} value={flight.id}>{flight.id} {flight.from} → {flight.to}</option>
                  ))}
                </select>
              </label>
              <label>
                Seats
                <input type="number" min={1} max={selectedFlight?.seats ?? 1} value={requestedSeats} onChange={(event) => setRequestedSeats(Number(event.target.value))} />
              </label>
              <button className="primary-button" onClick={bookFlight}>Book flight</button>
            </div>
            <div className="info-card">
              <h3>Your bookings</h3>
              {bookingSummary.length ? (
                <ul>{bookingSummary.map((summary, index) => <li key={index}>{summary}</li>)}</ul>
              ) : (
                <p>No bookings yet.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {screen === 'admin' && currentUser && isAdmin && (
        <section className="admin-grid">
          <div className="admin-header">
            <span className="eyebrow">Admin dashboard</span>
            <h2>Terminal access and operations</h2>
            <p>Manage flights, passenger accounts, and update the administrator password.</p>
          </div>

          <div className="admin-panels">
            <div className="admin-card">
              <h3>Add a new flight</h3>
              <label>
                Flight ID
                <input value={newFlight.id} onChange={(event) => setNewFlight({ ...newFlight, id: event.target.value })} placeholder="e.g. SFA101" />
              </label>
              <label>
                From
                <input value={newFlight.from} onChange={(event) => setNewFlight({ ...newFlight, from: event.target.value })} placeholder="e.g. LAX" />
              </label>
              <label>
                To
                <input value={newFlight.to} onChange={(event) => setNewFlight({ ...newFlight, to: event.target.value })} placeholder="e.g. JFK" />
              </label>
              <label>
                Depart
                <input value={newFlight.depart} onChange={(event) => setNewFlight({ ...newFlight, depart: event.target.value })} placeholder="YYYY-MM-DD HH:MM" />
              </label>
              <label>
                Arrive
                <input value={newFlight.arrive} onChange={(event) => setNewFlight({ ...newFlight, arrive: event.target.value })} placeholder="YYYY-MM-DD HH:MM" />
              </label>
              <label>
                Price
                <input type="number" value={newFlight.price} onChange={(event) => setNewFlight({ ...newFlight, price: Number(event.target.value) })} />
              </label>
              <label>
                Seats
                <input type="number" value={newFlight.seats} onChange={(event) => setNewFlight({ ...newFlight, seats: Number(event.target.value) })} />
              </label>
              <button className="primary-button" onClick={addFlight}>Add flight</button>
            </div>

            <div className="admin-card">
              <h3>Passenger accounts</h3>
              <div className="account-list">
                {passengerAccounts.length ? (
                  passengerAccounts.map((passenger) => (
                    <div key={passenger.username} className="account-row">
                      <span>{passenger.username}</span>
                      <button className="secondary-button" onClick={() => removePassenger(passenger.username)}>Remove</button>
                    </div>
                  ))
                ) : (
                  <p>No passenger accounts have been created yet.</p>
                )}
              </div>
            </div>

            <div className="admin-card">
              <h3>Flights overview</h3>
              {flights.length ? (
                flights.map((flight) => (
                  <div key={flight.id} className="flight-row">
                    <div>
                      <strong>{flight.id}</strong> {flight.from} → {flight.to}
                    </div>
                    <button className="secondary-button" onClick={() => deleteFlight(flight.id)}>Delete</button>
                  </div>
                ))
              ) : (
                <p>No flights added yet.</p>
              )}
            </div>

            <div className="admin-card">
              <h3>Admin settings</h3>
              <label>
                New admin password
                <input type="password" value={newAdminPassword} onChange={(event) => setNewAdminPassword(event.target.value)} placeholder="Enter new password" />
              </label>
              <label>
                New admin username
                <input type="text" value={newAdminUsername} onChange={(event) => setNewAdminUsername(event.target.value)} placeholder="Change admin username" />
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="primary-button" onClick={changeAdminPassword}>Update password</button>
                <button className="secondary-button" onClick={changeAdminCredentials}>Update credentials</button>
                <button className="secondary-button" onClick={exportLogins}>Download logins</button>
              </div>
            </div>
          </div>
        </section>
      )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
