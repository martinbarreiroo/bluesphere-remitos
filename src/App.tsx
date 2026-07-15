import { Building2, CalendarDays, CircleCheck, Eraser, FileText, Info, Maximize2, Plus, Printer, Save, Settings2, Trash2, Truck, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import './App.css'

type Contact = {
  id: string
  name: string
  address: string
  cuit: string
}

type RemitoItem = {
  id: string
  quantity: string
  description: string
}

type RemitoData = {
  customerName: string
  customerAddress: string
  customerCuit: string
  transporterName: string
  transporterAddress: string
  transporterCuit: string
  remitoDate: string
  items: RemitoItem[]
  offsetX: number
  offsetY: number
}

type StoredRemito = Partial<RemitoData> & { detail?: string }

const storageKey = 'bluesphere-remitos-v1'
const remitoWidthMm = 166
const remitoHeightMm = 195

const createItem = (description = ''): RemitoItem => ({ id: crypto.randomUUID(), quantity: '', description })

const createDefaultItems = () => [createItem('Descartadores 4 litros'), createItem('Descartadores 7 litros')]

const createEmptyRemito = (): RemitoData => ({
  customerName: '',
  customerAddress: '',
  customerCuit: '',
  transporterName: '',
  transporterAddress: '',
  transporterCuit: '',
  remitoDate: '',
  items: createDefaultItems(),
  offsetX: 0,
  offsetY: 0,
})

function readStored<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function readInitialRemito(): RemitoData {
  const stored = readStored<StoredRemito>(`${storageKey}-draft`, {})
  const items = Array.isArray(stored.items) && stored.items.length > 0
    ? stored.items
    : stored.detail?.trim()
      ? [createItem(stored.detail)]
      : createDefaultItems()

  return { ...createEmptyRemito(), ...stored, items }
}

function parseDate(value: string) {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toDateValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function formatDate(value: string) {
  const date = parseDate(value)
  if (!date) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

function getDateParts(value: string) {
  const date = parseDate(value)
  if (!date) return ['', '', '']
  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getFullYear()),
  ]
}

function parseQuantity(value: string) {
  const amount = Number(value.trim().replace(',', '.'))
  return Number.isFinite(amount) && amount > 0 ? amount : 0
}

function formatQuantity(value: string) {
  const amount = parseQuantity(value)
  return amount ? new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(amount) : ''
}

function App() {
  const [customers, setCustomers] = useState<Contact[]>(() => readStored(`${storageKey}-customers`, []))
  const [transporters, setTransporters] = useState<Contact[]>(() => readStored(`${storageKey}-transporters`, []))
  const [remito, setRemito] = useState<RemitoData>(readInitialRemito)
  const [customerId, setCustomerId] = useState('')
  const [transporterId, setTransporterId] = useState('')
  const [notice, setNotice] = useState('')
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const previewDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => localStorage.setItem(`${storageKey}-customers`, JSON.stringify(customers)), [customers])
  useEffect(() => localStorage.setItem(`${storageKey}-transporters`, JSON.stringify(transporters)), [transporters])
  useEffect(() => localStorage.setItem(`${storageKey}-draft`, JSON.stringify(remito)), [remito])
  useEffect(() => {
    const dialog = previewDialogRef.current
    if (!dialog) return
    if (isPreviewOpen && !dialog.open) dialog.showModal()
    if (!isPreviewOpen && dialog.open) dialog.close()
  }, [isPreviewOpen])

  const update = <K extends keyof RemitoData>(key: K, value: RemitoData[K]) => {
    setRemito((current) => ({ ...current, [key]: value }))
  }

  const updateItem = (id: string, key: 'quantity' | 'description', value: string) => {
    setRemito((current) => ({
      ...current,
      items: current.items.map((item) => item.id === id ? { ...item, [key]: value } : item),
    }))
  }

  const addItem = () => setRemito((current) => ({ ...current, items: [...current.items, createItem()] }))

  const removeItem = (id: string) => setRemito((current) => ({
    ...current,
    items: current.items.filter((item) => item.id !== id),
  }))

  const clearCustomer = () => {
    setCustomerId('')
    setRemito((current) => ({ ...current, customerName: '', customerAddress: '', customerCuit: '' }))
  }

  const clearTransporter = () => {
    setTransporterId('')
    setRemito((current) => ({ ...current, transporterName: '', transporterAddress: '', transporterCuit: '' }))
  }

  const clearDetail = () => setRemito((current) => ({ ...current, items: createDefaultItems() }))

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
    setNotice('En la ventana de impresión elegí el tamaño 166 × 195 mm, escala 100 % y sin encabezados ni márgenes.')
    window.setTimeout(() => window.print(), 100)
  }

  const printableItems = remito.items.filter((item) => parseQuantity(item.quantity) > 0 && item.description.trim())
  const totalQuantity = printableItems.reduce((total, item) => total + parseQuantity(item.quantity), 0)

  return (
    <>
      <main className="app-shell">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand-lockup">
              <img className="brand-logo" src="/bluesphere-logo.png" alt="Bluesphere Servicios Ambientales S.A." />
              <span className="brand-divider" aria-hidden="true" />
              <div className="app-identity">
                <span className="app-kicker">Operaciones</span>
                <h1 className="brand-app-title">Emisor de remitos</h1>
              </div>
            </div>
            <div className="topbar-tools" aria-label="Estado de la aplicación">
              <div className="topbar-status">
                <span className="topbar-meta-icon"><CircleCheck size={18} /></span>
                <span className="topbar-meta-copy"><small>Borrador local</small><strong>Guardado automático</strong></span>
              </div>
              <div className="document-spec">
                <span className="topbar-meta-icon"><FileText size={18} /></span>
                <span className="topbar-meta-copy"><small>Formato de impresión</small><strong>166 × 195 mm</strong></span>
              </div>
            </div>
          </div>
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
              <div className="form-title"><CalendarDays size={19} /><h3>Fecha del remito</h3><button className="btn-secondary section-clear" type="button" onClick={() => update('remitoDate', '')}><Eraser size={14} /> Limpiar</button></div>
              <div className="date-input-row">
                <button className="date-input" type="button" onClick={() => setIsCalendarOpen((open) => !open)} aria-expanded={isCalendarOpen}>
                  <CalendarDays size={18} />
                  {remito.remitoDate ? formatDate(remito.remitoDate) : 'Seleccionar fecha'}
                </button>
              </div>
              {isCalendarOpen && <div className="calendar-panel">
                <DayPicker
                  mode="single"
                  selected={parseDate(remito.remitoDate)}
                  onSelect={(date) => {
                    update('remitoDate', date ? toDateValue(date) : '')
                    setIsCalendarOpen(false)
                  }}
                  showOutsideDays
                />
              </div>}
              <p className="helper">Se imprimirá en el encabezado del remito.</p>
            </div>

            <div className="form-group form-group-accent">
              <div className="form-title"><Building2 size={19} /><h3>Destinatario</h3><button className="btn-secondary section-clear" type="button" onClick={clearCustomer}><Eraser size={14} /> Limpiar</button></div>
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
              <div className="form-title"><Truck size={19} /><h3>Transportista</h3><button className="btn-secondary section-clear" type="button" onClick={clearTransporter}><Eraser size={14} /> Limpiar</button></div>
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
              <div className="form-title"><FileText size={19} /><h3>Detalle</h3><button className="btn-secondary section-clear" type="button" onClick={clearDetail}><Eraser size={14} /> Limpiar</button></div>
              <p className="helper detail-intro">Cada renglón se imprime con la cantidad en su propia columna. Dejá vacía una cantidad para no imprimirla.</p>
              <div className="detail-lines" role="list" aria-label="Renglones del detalle">
                {remito.items.map((item) => <div className="detail-line" role="listitem" key={item.id}>
                  <div><label htmlFor={`quantity-${item.id}`}>Cantidad</label><input id={`quantity-${item.id}`} value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} inputMode="decimal" placeholder="0" /></div>
                  <div><label htmlFor={`description-${item.id}`}>Producto</label><input id={`description-${item.id}`} value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} placeholder="Descripción del producto" /></div>
                  <button className="icon-button" type="button" onClick={() => removeItem(item.id)} aria-label={`Eliminar ${item.description || 'renglón'}`}><Trash2 size={17} /></button>
                </div>)}
              </div>
              <button className="btn-secondary small-button" type="button" onClick={addItem}><Plus size={16} /> Agregar otro producto</button>
              <p className="detail-total">Total a entregar: <strong>{new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(totalQuantity)}</strong></p>
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
            <div className="preview-heading">
              <div><p className="section-label">No se imprime</p><h2>Vista previa</h2></div>
              <div className="preview-actions"><span>166 × 195 mm</span><button className="btn-secondary preview-expand" type="button" onClick={() => setIsPreviewOpen(true)}><Maximize2 size={15} /> Ver hoja grande</button></div>
            </div>
            <div className="paper-shadow"><RemitoFields remito={remito} withReference /></div>
            <div className="info-box"><Info size={18} /><p>La imagen es sólo una guía de posición. En el papel real se imprimen únicamente los textos cargados.</p></div>
          </aside>
        </div>
      </main>

      <div className="print-sheet" aria-hidden="true"><RemitoFields remito={remito} /></div>

      <dialog className="preview-modal" ref={previewDialogRef} aria-labelledby="preview-modal-title" onClose={() => setIsPreviewOpen(false)}>
        <div className="preview-modal-header">
          <div><p className="section-label">Vista de prueba</p><h2 id="preview-modal-title">Hoja del remito</h2></div>
          <button className="icon-button" type="button" onClick={() => setIsPreviewOpen(false)} aria-label="Cerrar vista previa"><X size={19} /></button>
        </div>
        <div className="paper-shadow preview-paper"><RemitoFields remito={remito} withReference /></div>
        <p className="preview-modal-note">Esta vista usa la hoja como guía. Al imprimir se omite el fondo y salen sólo los datos cargados.</p>
      </dialog>
    </>
  )
}

function RemitoFields({ remito, withReference = false }: { remito: RemitoData; withReference?: boolean }) {
  const transform = {
    transform: withReference
      ? `translate(${(remito.offsetX / remitoWidthMm) * 100}%, ${(remito.offsetY / remitoHeightMm) * 100}%)`
      : `translate(${remito.offsetX}mm, ${remito.offsetY}mm)`,
  }
  const printableItems = remito.items.filter((item) => parseQuantity(item.quantity) > 0 && item.description.trim())
  const [dateDay, dateMonth, dateYear] = getDateParts(remito.remitoDate)
  return (
    <div className={`remito-sheet${withReference ? ' with-reference' : ''}`}>
      {withReference && <img className="remito-reference" src="/remito-reference.jpg?v=20260715-clear" alt="Formulario de remito como guía visual" />}
      <div className="print-fields" style={transform}>
        <div className="print-field remito-date" aria-label={formatDate(remito.remitoDate)}>
          <span>{dateDay}</span><span>{dateMonth}</span><span>{dateYear}</span>
        </div>
        <span className="print-field customer-name">{remito.customerName}</span>
        <span className="print-field customer-address">{remito.customerAddress}</span>
        <span className="print-field customer-cuit">{remito.customerCuit}</span>
        <span className="print-field transporter-name">{remito.transporterName}</span>
        <span className="print-field transporter-address">{remito.transporterAddress}</span>
        <span className="print-field transporter-cuit">{remito.transporterCuit}</span>
        <div className="print-field detail-rows">
          {printableItems.map((item) => <div className="detail-print-row" key={item.id}>
            <span className="detail-print-quantity">{formatQuantity(item.quantity)}</span>
            <span className="detail-print-description">{item.description}</span>
          </div>)}
        </div>
      </div>
    </div>
  )
}

export default App
