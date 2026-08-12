
import { useState } from 'react'
import api from './services/Api.jsx'

const MAX_SELECTED = 5

const COUNTRY_CODES = [
  { code: '+62', label: 'Indonesia' },
  { code: '+1', label: 'US/Canada' },
  { code: '+44', label: 'UK' },
  { code: '+60', label: 'Malaysia' },
  { code: '+65', label: 'Singapore' },
  { code: '+91', label: 'India' },
  { code: '+61', label: 'Australia' },
  { code: '+66', label: 'Thailand' },
]

const INITIAL_CONTACTS = [
  { id: 1, name: 'Eja Ganteng', phone: '6281572760056' },
  { id: 2, name: 'Ajin', phone: '62895324817406' },
  { id: 4, name: 'Fathan', phone: '6288294783726' },
]

export default function App(){
  const [message, setMessage] = useState('')
  const [contacts, setContacts] = useState(INITIAL_CONTACTS)
  const [selected, setSelected] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCountry, setNewCountry] = useState('+62')
  const [newNumber, setNewNumber] = useState('')
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState([])

  function toggleContact(id){
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(c => c !== id))
      return
    }
    if (selected.length >= MAX_SELECTED) return
    setSelected(prev => [...prev, id])
  }

  function addContact(){
    const digits = newNumber.trim().replace(/[^0-9]/g, '')  
    if (!newName.trim() || !digits) return
    const phone = newCountry.replace('+', '') + digits
    setContacts(prev => [
      ...prev,
      { id: Date.now(), name: newName.trim(), phone },
    ])
    setNewName('')
    setNewNumber('')
    setShowAddForm(false)
  }

  function deleteContact(id){
    setContacts(prev => prev.filter(c => c.id !== id))
    setSelected(prev => prev.filter(c => c !== id))
  }

  async function sendMessage(){
    const targets = contacts.filter(c => selected.includes(c.id)).map(c => c.phone)
    if (!message.trim() || targets.length === 0) return

    setSending(true)
    setResults([])
    try {
      const res = await api.post('/send', {
        to: targets,
        message: message.trim(),
      })
      setResults(res.data.results ?? [])
    } catch (err) {
      const errors = err.response?.data?.errors
      const detail = errors
        ? Object.values(errors).flat().join(' • ')
        : 'Gagal terhubung ke server. Pastikan backend berjalan.'
      setResults([{ to: '', status: 'error', error: detail }])
    } finally {
      setSending(false)
    }
  }

  return (

    <>
    
    {/* Nav */}
    <div className="container rounded-5 navbar bg-light shadow-lg p-3 ">
      <div className='fw-bold  p-2 '>
        <i className='bi-whatsapp bg-warning p-2 rounded-5'></i>
      </div>
      
    </div>

    {/* Hero */}
    <div className="container justify-content-center align-items-center d-flex bg-light text-dark" style={{borderEndStartRadius:"50px",borderEndEndRadius:"50px"}}>
      
      <div className="row mt-5 mb-5">

        <div className="col-md-8">
          <h1 style={{fontWeight:"800",fontSize:"70px"}}>Send <span className="text-warning">WhatsApp</span></h1>
          <p>Send WhatsApp Message Faster</p>
          {/* <button className="btn btn-outline-light w-25">Start Message</button> */}
        </div>
        
        <div className="col-md-4 text-center bg-warning rounded-5">
          <i className="bi bi-whatsapp" style={{fontWeight:"800",fontSize:"150px"}}></i>
        </div>

        <div className="col-md-12">
          <hr />
        </div>

      </div>

    </div>

    {/* Content */}
    <div className="container bg-light shadow-lg mt-4 rounded-4 mb-5 p-4 " style={{border:"1px solid #05050550"}}>
      
      <div className="row">

        {/* Message Body */}
        <div className="col-md-7">
          <label className="form-label text-dark ">Body Message</label>
          <textarea
            className="form-control bg-secondary-subtle"
            rows="12"
            placeholder="Type your message.."
            value={message}
            onChange={e => setMessage(e.target.value)}
          ></textarea>

          <button
            type="button"
            className="btn btn-primary w-100 mt-3 fw-bold"
            disabled={!message.trim() || selected.length === 0 || sending}
            onClick={sendMessage}
          >
            {sending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Sending...
              </>
            ) : (
              <>
                <i className="bi bi-send-fill me-2"></i>
                Send
              </>
            )}
          </button>

          {results.length > 0 && (
            <div className="mt-3">
              {results.map((result, i) => (
                <div
                  key={i}
                  className={`alert py-2 px-3 mb-2 d-flex align-items-center gap-2 ${
                    result.status === 'success' ? 'alert-success' : 'alert-danger'
                  }`}
                >
                  <i className={`bi ${result.status === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <div>
                    {result.to && <span className="fw-bold">{result.to}</span>}
                    {result.to && <span className="mx-1">-</span>}
                    {result.status === 'success' ? 'Terkirim' : result.error}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-md-5">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label text-dark mb-2">Select Receiver</label>
            <button
              type="button"
              className="btn btn-sm btn-warning fw-bold mb-2 mt-2 w-15 "
              onClick={() => setShowAddForm(v => !v)}
            >
              <i className="bi bi-person-plus-fill me-1"></i>
            </button>
          </div>

        {showAddForm && (
            <div className="bg-warning-subtle border border-warning rounded-3 p-2 mb-2 d-flex flex-column gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <div className="d-flex gap-2">
                <select
                  className="form-select form-select-sm w-auto fw-bold"
                  value={newCountry}
                  onChange={e => setNewCountry(e.target.value)}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} {c.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="xxx"
                  value={newNumber}
                  onChange={e => setNewNumber(e.target.value)}
                />
                <button type="button" className="btn btn-sm btn-success" onClick={addContact}>
                  <i className="bi bi-check-lg"></i>
                </button>
              </div>
            </div>
          )}

          <div className="list-group" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {
              contacts.length == 0 ? 
              <div className='bg-light d-flex justify-content-center align-items-center ' style={{height:"300px"}}>
                - No contact yet -
              </div>
              : 
              contacts.map(contact => {
                const isSelected = selected.includes(contact.id)
                const disabled = !isSelected && selected.length >= MAX_SELECTED
                return (
                  <label
                    key={contact.id}
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-3 justify-content-between ${
                      isSelected ? 'active' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className='d-flex gap-2'>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isSelected}
                        disabled={disabled}
                        onChange={() => toggleContact(contact.id)}
                      />
                      <div className="d-flex flex-column">
                        <span className="fw-bold">{contact.name}</span>
                        <small className={isSelected ? '' : 'text-secondary'}>
                          <i className='bi bi-telephone me-2'></i>{contact.phone}
                        </small>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm bi bi-trash"
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        deleteContact(contact.id)
                      }}
                    ></button>
                  </label>
                )
              })
            }
            
            
          </div>

          <p className="text-dark mt-2 mb-0">
            <i className="bi bi-check-circle me-1"></i>
            {selected.length}/{MAX_SELECTED} Receiver Selected
          </p>
        </div>

      </div>

    </div>


    <div className="footer p-2 shadow-lg bg-light ">
      © Fitra Riadi -  2026
    </div>


    </>
  )
}