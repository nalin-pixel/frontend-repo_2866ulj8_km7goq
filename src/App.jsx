import { useEffect, useState } from 'react'
import { login, signup, apiGet, apiPost, getToken, clearToken, BASE_URL } from './api'

function Section({ title, children, id }) {
  return (
    <section id={id} className="py-16">
      <h2 className="text-3xl font-semibold mb-6">{title}</h2>
      {children}
    </section>
  )
}

function Navbar({ onLogout, authed }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed top-0 left-0 right-0 z-20 backdrop-blur bg-white/60 border-b">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-16">
        <a href="#home" className="text-2xl font-bold tracking-wide">COVA</a>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#menu" className="hover:text-blue-600">Menu</a>
          <a href="#bestsellers" className="hover:text-blue-600">Bestsellers</a>
          <a href="#book" className="hover:text-blue-600">Book a Table</a>
          <a href="#order" className="hover:text-blue-600">Online Orders</a>
          <a href="#location" className="hover:text-blue-600">Location</a>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {authed ? (
            <button onClick={onLogout} className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-black">Logout</button>
          ) : (
            <a href="#auth" className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-black">Sign in</a>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>☰</button>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <a href="#menu" className="block">Menu</a>
          <a href="#bestsellers" className="block">Bestsellers</a>
          <a href="#book" className="block">Book a Table</a>
          <a href="#order" className="block">Online Orders</a>
          <a href="#location" className="block">Location</a>
          {authed ? (
            <button onClick={onLogout} className="w-full px-4 py-2 rounded bg-gray-900 text-white">Logout</button>
          ) : (
            <a href="#auth" className="w-full inline-block px-4 py-2 rounded bg-gray-900 text-white">Sign in</a>
          )}
        </div>
      )}
    </header>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(!!getToken())
  const [menu, setMenu] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [loading, setLoading] = useState(false)
  const [authMode, setAuthMode] = useState('signin')

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await apiGet('/menu')
        setMenu(data)
        setBestsellers(data.filter(d => d.is_bestseller))
      } catch (e) {
        // ignore if empty
      }
    }
    loadMenu()
  }, [])

  const handleLogout = () => {
    clearToken()
    setAuthed(false)
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value
    setLoading(true)
    try {
      await login(email, password)
      setAuthed(true)
      alert('Signed in successfully')
    } catch (err) {
      alert('Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    setLoading(true)
    try {
      await signup({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
      })
      setAuthed(true)
      alert('Account created')
    } catch (err) {
      alert('Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())
    setLoading(true)
    try {
      await apiPost('/bookings', {
        name: payload.b_name,
        phone: payload.b_phone,
        email: payload.b_email,
        date: payload.b_date,
        time: payload.b_time,
        guests: Number(payload.b_guests),
        notes: payload.b_notes,
      })
      alert('Booking requested!')
    } catch (e) {
      alert('Booking failed. Please try again.')
    } finally { setLoading(false) }
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const items = menu.slice(0,1).map(m => ({ item_id: String(m._id), quantity: 1 }))
    setLoading(true)
    try {
      await apiPost('/orders', {
        items,
        total: items.reduce((s,i)=> s + (menu.find(m=> String(m._id)===i.item_id)?.price||0)*i.quantity, 0),
        address: form.get('address') || '',
        notes: form.get('notes') || '',
      })
      alert('Order placed!')
    } catch (e) {
      alert('Order failed. Please sign in first.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900">
      <Navbar authed={authed} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl px-4 pt-24">
        <section id="home" className="py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">COVA</h1>
          <p className="mt-4 text-lg text-gray-600">A minimal restaurant experience. Reserve, order, and enjoy our bestselling dishes.</p>
          <div className="mt-8 flex gap-3 justify-center">
            <a href="#menu" className="px-5 py-3 rounded bg-gray-900 text-white hover:bg-black">Explore Menu</a>
            <a href="#book" className="px-5 py-3 rounded border border-gray-300 hover:border-gray-500">Book a Table</a>
          </div>
        </section>

        <Section id="menu" title="Menu">
          {menu.length === 0 ? (
            <p className="text-gray-500">Menu coming soon.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menu.map(item => (
                <div key={item._id} className="rounded-xl border p-4 bg-white shadow-sm">
                  {item.image && <img src={item.image} alt={item.name} className="rounded-md mb-3 h-40 w-full object-cover" />}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  {item.is_bestseller && <span className="mt-2 inline-block text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">Bestseller</span>}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section id="bestsellers" title="Bestselling Dishes">
          {bestsellers.length === 0 ? (
            <p className="text-gray-500">Bestsellers will appear here once added.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestsellers.map(item => (
                <div key={item._id} className="rounded-xl border p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section id="book" title="Book a Table">
          <form onSubmit={handleBooking} className="grid md:grid-cols-2 gap-4 bg-white p-6 rounded-xl border">
            <input name="b_name" required placeholder="Your name" className="border rounded px-3 py-2" />
            <input name="b_phone" required placeholder="Phone" className="border rounded px-3 py-2" />
            <input name="b_email" type="email" placeholder="Email (optional)" className="border rounded px-3 py-2 md:col-span-2" />
            <input name="b_date" type="date" required className="border rounded px-3 py-2" />
            <input name="b_time" type="time" required className="border rounded px-3 py-2" />
            <input name="b_guests" type="number" min="1" max="20" required placeholder="Guests" className="border rounded px-3 py-2" />
            <input name="b_notes" placeholder="Notes" className="border rounded px-3 py-2 md:col-span-2" />
            <button disabled={loading} className="md:col-span-2 px-4 py-2 rounded bg-gray-900 text-white hover:bg-black">
              {loading ? 'Submitting...' : 'Reserve'}
            </button>
          </form>
        </Section>

        <Section id="order" title="Online Orders">
          <form onSubmit={handleOrder} className="space-y-3 bg-white p-6 rounded-xl border">
            <p className="text-gray-600 text-sm">For demo, the first menu item will be added to your cart.</p>
            <input name="address" placeholder="Delivery address" className="border rounded px-3 py-2 w-full" />
            <input name="notes" placeholder="Notes" className="border rounded px-3 py-2 w-full" />
            <button disabled={loading} className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-black">
              {loading ? 'Placing...' : 'Place Order'}
            </button>
          </form>
        </Section>

        <Section id="auth" title="Sign in / Sign up">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">Sign in</h3>
              <form onSubmit={handleSignIn} className="space-y-3">
                <input name="email" type="email" required placeholder="Email" className="border rounded px-3 py-2 w-full" />
                <input name="password" type="password" required placeholder="Password" className="border rounded px-3 py-2 w-full" />
                <button disabled={loading} className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-black w-full">{loading ? 'Signing in...' : 'Sign in'}</button>
              </form>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">Create account</h3>
              <form onSubmit={handleSignUp} className="space-y-3">
                <input name="name" required placeholder="Full name" className="border rounded px-3 py-2 w-full" />
                <input name="email" type="email" required placeholder="Email" className="border rounded px-3 py-2 w-full" />
                <input name="phone" placeholder="Phone" className="border rounded px-3 py-2 w-full" />
                <input name="password" type="password" required placeholder="Password" className="border rounded px-3 py-2 w-full" />
                <button disabled={loading} className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-black w-full">{loading ? 'Creating...' : 'Sign up'}</button>
              </form>
            </div>
          </div>
        </Section>

        <Section id="location" title="Location">
          <div className="bg-white p-6 rounded-xl border">
            <LocationCard />
          </div>
        </Section>
      </main>

      <footer className="py-10 text-center text-sm text-gray-500">© {new Date().getFullYear()} COVA</footer>
    </div>
  )
}

function LocationCard() {
  const [loc, setLoc] = useState(null)
  useEffect(() => {
    apiGet('/location').then(setLoc).catch(()=>{})
  }, [])
  if (!loc) return <p className="text-gray-500">Loading...</p>
  return (
    <div className="space-y-2">
      <p><span className="font-semibold">Address:</span> {loc.address}</p>
      <p><span className="font-semibold">Phone:</span> {loc.phone}</p>
      <p><span className="font-semibold">Hours:</span> {loc.opening_hours}</p>
      <a className="text-blue-600 underline" href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`} target="_blank">Open in Maps</a>
    </div>
  )
}
