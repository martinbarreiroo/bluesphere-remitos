import { Building2, FileText, Info, Printer, Save, Settings2, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import './App.css'

type Contact = {
  id: string
  name: string
  address: string
  cuit: string
}

type RemitoData = {
  customerName: string
  customerAddress: string
  customerCuit: string
  transporterName: string
  transporterAddress: string
  transporterCuit: string
  detail: string
  offsetX: number
  offsetY: number
}

const storageKey = 'bluesphere-remitos-v1'

const emptyRemito: RemitoData = {
  customerName: '',
  customerAddress: '',
  customerCuit: '',
  transporterName: '',
  transporterAddress: '',
  transporterCuit: '',
  detail: '',
  offsetX: 0,
  offsetY: 0,
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [customers, setCustomers] = useState<Contact[]>(() => readStored(`${storageKey}-customers`, []))
  const [transporters, setTransporters] = useState<Contact[]>(() => readStored(`${storageKey}-transporters`, []))
  const [remito, setRemito] = useState<RemitoData>(() => readStored(`${storageKey}-draft`, emptyRemito))
  const [customerId, setCustomerId] = useState('')
  const [transporterId, setTransporterId] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => localStorage.setItem(`${storageKey}-customers`, JSON.stringify(customers)), [customers])
  useEffect(() => localStorage.setItem(`${storageKey}-transporters`, JSON.stringify(transporters)), [transporters])
  useEffect(() => localStorage.setItem(`${storageKey}-draft`, JSON.stringify(remito)), [remito])

  const update = <K extends keyof RemitoData>(key: K, value: RemitoData[K]) => {
    setRemito((current) => ({ ...current, [key]: value }))
  }

  const loadCustomer = (id: string) => {
    setCustomerId(id)
    const contact = customers.find((customer) => customer.id === id)
    if (contact) {
      setRemito((current) => ({ ...current, customerName: contact.name, customerAddress: contact.address, customerCuit: contact.cuit }))
    }
  }

  const loadTransporter = (id: string) => {
    setTransporterId(id)
    const contact = transporters.find((transporter) => transporter.id === id)
    if (contact) {
      setRemito((current) => ({ ...current, transporterName: contact.name, transporterAddress: contact.address, transporterCuit: contact.cuit }))
    }
  }

  const saveContact = (kind: 'customer' | 'transporter') => {
    const isCustomer = kind === 'customer'
    const id = isCustomer ? customerId : transporterId
    const contact: Contact = {
      id: id || crypto.randomUUID(),
      name: isCustomer ? remito.customerName.trim() : remito.transporterName.trim(),
      address: isCustomer ? remito.customerAddress.trim() : remito.transporterAddress.trim(),
      cuit: isCustomer ? remito.customerCuit.trim() : remito.transporterCuit.trim(),
    }

    if (!contact.name) {
      setNotice(`Completá el nombre del ${isCustomer ? 'cliente' : 'transportista'} antes de guardarlo.`)
      return
    }

    const updateContacts = (items: Contact[]) => {
      const exists = items.some((item) => item.id === contact.id)
      return exists ? items.map((item) => (item.id === contact.id ? contact : item)) : [...items, contact]
    }

    if (isCustomer) {
      setCustomers(updateContacts)
      setCustomerId(contact.id)
    } else {
      setTransporters(updateContacts)
      setTransporterId(contact.id)
    }
    setNotice(`${isCustomer ? 'Cliente' : 'Transportista'} guardado en la agenda de esta computadora.`)
  }

  const printRemito = () => {
    setNotice('En la ventana de impresión elegí el tamaño 170 × 200 mm, escala 100 % y sin encabezados ni márgenes.')
    window.setTimeout(() => window.print(), 100)
  }

  return (
    <>
      <main className="app-shell">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">B</div>
            <div>
              <p className="eyebrow">Bluesphere</p>
              <h1>Emisor de remitos</h1>
            </div>
          </div>
          <div className="topbar-status"><FileText size={17} /> Formulario 170 × 200 mm</div>
        </header>

        <section className="intro no-print">
          <div>
            <div className="accent-bar" />
            <h2>Completá e imprimí sólo los datos necesarios</h2>
            <p>El número y el código de barras del remito físico no se modifican. Colocá la hoja en la impresora antes de imprimir.</p>
          </div>
          <button className="btn-primary" type="button" onClick={printRemito}><Printer size={18} /> Imprimir campos</button>
        </section>

        {notice && <div className="notice no-print" role="status"><Info size={18} /> {notice}<button type="button" onClick={() => setNotice('')} aria-label="Cerrar aviso">×</button></div>}

        <div className="workspace no-print">
          <section className="editor-card">
            <div className="card-heading">
              <div><p className="section-label">Datos a imprimir</p><h2>Nuevo remito</h2></div>
              <span className="draft-badge">Borrador guardado</span>
            </div>

            <div className="form-group form-group-accent">
              <div className="form-title"><Building2 size={19} /><h3>Destinatario</h3></div>
              <label htmlFor="customer-select">Cliente guardado</label>
              <select id="customer-select" value={customerId} onChange={(event) => loadCustomer(event.target.value)}>
                <option value="">Ingresar datos manualmente</option>
                {customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}
              </select>
              <div className="field-grid">
                <div className="field-wide"><label htmlFor="customer-name">Señor(es)</label><input id="customer-name" value={remito.customerName} onChange={(event) => update('customerName', event.target.value)} placeholder="Razón social o nombre" /></div>
                <div className="field-wide"><label htmlFor="customer-address">Domicilio</label><input id="customer-address" value={remito.customerAddress} onChange={(event) => update('customerAddress', event.target.value)} placeholder="Domicilio comercial" /></div>
                <div><label htmlFor="customer-cuit">CUIT</label><input id="customer-cuit" value={remito.customerCuit} onChange={(event) => update('customerCuit', event.target.value)} placeholder="00-00000000-0" /></div>
              </div>
              <button className="btn-secondary small-button" type="button" onClick={() => saveContact('customer')}><Save size={15} /> Guardar cliente</button>
            </div>

            <div className="form-group form-group-accent">
              <div className="form-title"><Truck size={19} /><h3>Transportista</h3></div>
              <label htmlFor="transporter-select">Transportista guardado</label>
              <select id="transporter-select" value={transporterId} onChange={(event) => loadTransporter(event.target.value)}>
                <option value="">Ingresar datos manualmente</option>
                {transporters.map((transporter) => <option value={transporter.id} key={transporter.id}>{transporter.name}</option>)}
              </select>
              <div className="field-grid">
                <div className="field-wide"><label htmlFor="transporter-name">Transportista</label><input id="transporter-name" value={remito.transporterName} onChange={(event) => update('transporterName', event.target.value)} placeholder="Nombre o razón social" /></div>
                <div className="field-wide"><label htmlFor="transporter-address">Domicilio</label><input id="transporter-address" value={remito.transporterAddress} onChange={(event) => update('transporterAddress', event.target.value)} placeholder="Domicilio" /></div>
                <div><label htmlFor="transporter-cuit">CUIT</label><input id="transporter-cuit" value={remito.transporterCuit} onChange={(event) => update('transporterCuit', event.target.value)} placeholder="00-00000000-0" /></div>
              </div>
              <button className="btn-secondary small-button" type="button" onClick={() => saveContact('transporter')}><Save size={15} /> Guardar transportista</button>
            </div>

            <div className="form-group form-group-accent">
              <div className="form-title"><FileText size={19} /><h3>Detalle</h3></div>
              <label htmlFor="detail">Cuerpo del remito</label>
              <textarea id="detail" value={remito.detail} onChange={(event) => update('detail', event.target.value)} placeholder="Escribí o pegá aquí el detalle que debe aparecer en el cuerpo del remito." rows={6} />
              <p className="helper">Se imprimirá dentro de la columna “Detalle”. Los saltos de línea se respetan.</p>
            </div>

            <div className="calibration-panel">
              <Settings2 size={20} />
              <div><h3>Calibración de impresión</h3><p>Usá valores de milímetros sólo si la prueba queda corrida.</p></div>
              <label>Horizontal<input type="number" value={remito.offsetX} onChange={(event) => update('offsetX', Number(event.target.value))} step="0.5" /> mm</label>
              <label>Vertical<input type="number" value={remito.offsetY} onChange={(event) => update('offsetY', Number(event.target.value))} step="0.5" /> mm</label>
            </div>

            <div className="editor-actions"><button className="btn-primary" type="button" onClick={printRemito}><Printer size={18} /> Imprimir campos</button></div>
          </section>

          <aside className="preview-panel">
            <div className="preview-heading"><div><p className="section-label">No se imprime</p><h2>Vista previa</h2></div><span>170 × 200 mm</span></div>
            <div className="paper-shadow"><RemitoFields remito={remito} withReference /></div>
            <div className="info-box"><Info size={18} /><p>La imagen es sólo una guía de posición. En el papel real se imprimen únicamente los textos cargados.</p></div>
          </aside>
        </div>
      </main>

      <div className="print-sheet" aria-hidden="true"><RemitoFields remito={remito} /></div>
    </>
  )
}

function RemitoFields({ remito, withReference = false }: { remito: RemitoData; withReference?: boolean }) {
  const transform = { transform: `translate(${remito.offsetX}mm, ${remito.offsetY}mm)` }
  return (
    <div className={`remito-sheet${withReference ? ' with-reference' : ''}`}>
      {withReference && <img className="remito-reference" src="/remito-reference.jpg" alt="Formulario de remito como guía visual" />}
      <div className="print-fields" style={transform}>
        <span className="print-field customer-name">{remito.customerName}</span>
        <span className="print-field customer-address">{remito.customerAddress}</span>
        <span className="print-field customer-cuit">{remito.customerCuit}</span>
        <span className="print-field transporter-name">{remito.transporterName}</span>
        <span className="print-field transporter-address">{remito.transporterAddress}</span>
        <span className="print-field transporter-cuit">{remito.transporterCuit}</span>
        <p className="print-field detail-text">{remito.detail}</p>
      </div>
    </div>
  )
}

export default App
