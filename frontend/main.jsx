import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,useLocation,useNavigate,Routes,Route,NavLink} from 'react-router-dom';
import axios from 'axios';
import {motion} from 'framer-motion';
import {LayoutDashboard,Truck,Siren,TrendingUp,GitCompare,FileText,Settings,Activity,Menu,X,ArrowRight,ShieldCheck,AlertTriangle,PackageSearch,RefreshCw,BrainCircuit,Download,FileBarChart2,ClipboardList,PackageCheck,TriangleAlert,Database,CalendarRange} from 'lucide-react';
import {BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,Cell} from 'recharts';
import './styles.css';

const API=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL||'http://localhost:8000',timeout:30000});
const api={health:()=>API.get('/api/health'),summary:()=>API.get('/api/project-summary'),dataco:()=>API.get('/api/dataco/results'),datacoPredict:x=>API.post('/api/dataco/predict',x),scms:()=>API.get('/api/scms/results'),scmsPredict:x=>API.post('/api/scms/predict',x),imbalance:()=>API.get('/api/scms/imbalance'),m5:()=>API.get('/api/m5/results'),forecast:x=>API.post('/api/m5/forecast',x),models:()=>API.get('/api/models/comparison'),features:()=>API.get('/api/features')};
const fmtPct=x=>x==null?'—':`${(x*100).toFixed(1)}%`;
const pretty=s=>String(s||'').replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase());
function useHealth(){const [h,setH]=useState(null);const [loading,setLoading]=useState(true);const load=()=>{setLoading(true);api.health().then(r=>setH(r.data)).catch(()=>setH(null)).finally(()=>setLoading(false))};useEffect(load,[]);return {h,loading,reload:load}}
function Shell({children}){const [open,setOpen]=useState(false);const {h,reload}=useHealth();const nav=[['/','Dashboard',LayoutDashboard],['/delivery-risk','Delivery Risk',Truck],['/supplier-risk','Supplier Risk',Siren],['/demand-forecast','Demand Forecast',TrendingUp],['/decision-center','Decision Center',GitCompare],['/reports','Reports',FileText],['/model-insights','Model Insights',BrainCircuit]];return <div className="app"><aside className={open?'sidebar open':'sidebar'}><div className="brand"><div className="logo">SC</div><div><b>SupplyChain AI</b><span>Manufacturing Intelligence</span></div><button className="mobile-x" onClick={()=>setOpen(false)}><X/></button></div><nav>{nav.map(([to,label,I])=><NavLink onClick={()=>setOpen(false)} key={to} to={to} end={to==='/' } className={({isActive})=>isActive?'active':''}><I size={18}/>{label}</NavLink>)}</nav><div className="side-status"><div className="muted">BACKEND STATUS</div><div className="status-row"><span className={h?'dot on':'dot'}></span>{h?'Connected':'Disconnected'}<button onClick={reload} title="Refresh"><RefreshCw size={14}/></button></div></div></aside><main><header><button className="menu" onClick={()=>setOpen(true)}><Menu/></button><div><div className="eyebrow">MANUFACTURING CONTROL CENTER</div><div className="top-title">AI Supply Chain Analytics</div></div><div className="top-right"><span className={h?'pill success':'pill danger'}><span className="dot"></span>{h?'API Online':'API Offline'}</span></div></header><div className="content">{children}</div></main></div>}
function Page({title,sub,children,action}){return <div><div className="page-head"><div><h1>{title}</h1><p>{sub}</p></div>{action}</div>{children}</div>}
function Card({children,className='',...props}){return <motion.section initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} {...props} className={'card '+className}>{children}</motion.section>}
function Metric({label,value,sub,icon:I}){return <Card className="metric"><div className="metric-icon"><I size={19}/></div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></Card>}
function Dashboard(){const {h}=useHealth();const [s,setS]=useState(null);useEffect(()=>{api.summary().then(r=>setS(r.data)).catch(()=>{})},[]);return <Page title="Supply Chain Command Center" sub="Analyze delivery risk, supplier risk and future demand from one workspace."><div className="hero"><div><span className="tag">AI-POWERED OPERATIONS</span><h2>Turn supply-chain data into <em>actionable signals.</em></h2><p>Run a real prediction or forecast using the trained models behind this application.</p></div><Activity size={76}/></div><div className="grid four"><Metric label="Delivery Model" value={pretty(s?.systems?.dataco_delivery_risk?.best_model?.model)} sub="DataCo" icon={Truck}/><Metric label="Supplier Model" value={pretty(s?.systems?.scms_supplier_delay?.best_model?.model)} sub="SCMS" icon={Siren}/><Metric label="Forecast Model" value={pretty(s?.systems?.m5_demand_forecasting?.best_model?.model)} sub="M5-style" icon={TrendingUp}/><Metric label="System" value={h?'Ready':'Offline'} sub="FastAPI service" icon={Activity}/></div><div className="grid three action-grid"><Action to="/delivery-risk" icon={Truck} title="Delivery Risk" text="Check whether an order is likely to arrive late."/><Action to="/supplier-risk" icon={Siren} title="Supplier Risk" text="Assess shipment delay risk before dispatch."/><Action to="/demand-forecast" icon={TrendingUp} title="Demand Forecast" text="Generate future demand for a selected series."/></div></Page>}
function Action({to,icon:I,title,text}){const nav=useNavigate();return <Card className="action" onClick={()=>nav(to)}><div className="action-icon"><I/></div><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="arrow"/></Card>}
const datacoDefaults={shipping_mode:'Standard Class',order_region:'Europe',product_category:'Electronics',product_weight_kg:5,order_quantity:2,unit_price:100,discount_rate:.05,distance_km:1000,scheduled_shipping_days:5,order_date:new Date().toISOString().slice(0,10)};
function RiskResult({data,type}){if(!data)return <div className="result-empty"><ShieldCheck size={34}/><p>Enter the details and run analysis.</p></div>;const prob=type==='delivery'?data.late_probability:data.delay_probability;const high=prob>=.6||data.prediction==='Late'||data.prediction==='Delayed';return <div className="result"><div className={'risk-banner '+(high?'high':'low')}><div className="risk-symbol">{high?<AlertTriangle/>:<ShieldCheck/>}</div><div><span>AI ANALYSIS</span><h2>{data.prediction}</h2><p>{high?'Elevated risk detected for this input.':'The model did not flag this input as delayed.'}</p></div></div><div className="risk-grid"><div><span>Risk Probability</span><strong>{fmtPct(prob)}</strong></div><div><span>Model</span><strong>{pretty(data.model_used)}</strong></div><div><span>Strategy</span><strong>{pretty(data.imbalance_strategy_used)}</strong></div></div></div>}
function FormField({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Delivery(){const [f,setF]=useState(datacoDefaults),[res,setRes]=useState(null),[busy,setBusy]=useState(false),[err,setErr]=useState('');const set=(k,v)=>setF(x=>({...x,[k]:v}));const submit=e=>{e.preventDefault();setBusy(true);setErr('');api.datacoPredict({...f,product_weight_kg:+f.product_weight_kg,order_quantity:+f.order_quantity,unit_price:+f.unit_price,discount_rate:+f.discount_rate,distance_km:+f.distance_km,scheduled_shipping_days:+f.scheduled_shipping_days}).then(r=>setRes(r.data)).catch(e=>setErr(e.response?.data?.detail||'Prediction failed.')).finally(()=>setBusy(false))};return <Page title="Delivery Risk Analysis" sub="Enter order information to estimate late-delivery probability."><div className="workspace"><Card><div className="card-head"><div><h3>Order Details</h3><p>Fields match the DataCo prediction API.</p></div></div><form onSubmit={submit} className="form-grid">{[['shipping_mode','Shipping Mode','text'],['order_region','Order Region','text'],['product_category','Product Category','text'],['product_weight_kg','Weight (kg)','number'],['order_quantity','Quantity','number'],['unit_price','Unit Price','number'],['discount_rate','Discount Rate (0–0.9)','number'],['distance_km','Distance (km)','number'],['scheduled_shipping_days','Scheduled Days','number'],['order_date','Order Date','date']].map(([k,l,t])=><FormField key={k} label={l}><input type={t} step="any" value={f[k]} onChange={e=>set(k,e.target.value)} required/></FormField>)}<button className="primary full" disabled={busy}>{busy?'Analyzing…':'Analyze Delivery Risk'}</button></form>{err&&<div className="error">{err}</div>}</Card><Card><div className="card-head"><div><h3>Prediction</h3><p>Live result from the trained backend model.</p></div></div><RiskResult data={res} type="delivery"/></Card></div></Page>}
const scmsDefaults={supplier_name:'Supplier A',supplier_reliability_score:.85,supplier_past_delay_rate:.1,shipment_mode:'Air',lead_time_days:5,typical_lead_time_days:5,order_quantity:5000,unit_cost:10,destination_region:'Southeast Asia',distance_km:3000};
function Supplier(){const [f,setF]=useState(scmsDefaults),[res,setRes]=useState(null),[busy,setBusy]=useState(false),[err,setErr]=useState('');const set=(k,v)=>setF(x=>({...x,[k]:v}));const submit=e=>{e.preventDefault();setBusy(true);setErr('');api.scmsPredict({...f,supplier_reliability_score:+f.supplier_reliability_score,supplier_past_delay_rate:+f.supplier_past_delay_rate,lead_time_days:+f.lead_time_days,typical_lead_time_days:+f.typical_lead_time_days,order_quantity:+f.order_quantity,unit_cost:+f.unit_cost,distance_km:+f.distance_km}).then(r=>setRes(r.data)).catch(e=>setErr(e.response?.data?.detail||'Prediction failed.')).finally(()=>setBusy(false))};return <Page title="Supplier & Shipment Risk" sub="Assess supplier and logistics delay risk before a shipment moves."><div className="workspace"><Card><div className="card-head"><div><h3>Shipment Details</h3><p>Use supplier history and logistics information.</p></div></div><form onSubmit={submit} className="form-grid">{[['supplier_name','Supplier','text'],['supplier_reliability_score','Reliability Score (0–1)','number'],['supplier_past_delay_rate','Past Delay Rate (0–1)','number'],['shipment_mode','Shipment Mode','text'],['lead_time_days','Lead Time (days)','number'],['typical_lead_time_days','Typical Lead Time','number'],['order_quantity','Quantity','number'],['unit_cost','Unit Cost','number'],['destination_region','Destination Region','text'],['distance_km','Distance (km)','number']].map(([k,l,t])=><FormField key={k} label={l}><input type={t} step="any" value={f[k]} onChange={e=>set(k,e.target.value)} required/></FormField>)}<button className="primary full" disabled={busy}>{busy?'Analyzing…':'Analyze Supplier Risk'}</button></form>{err&&<div className="error">{err}</div>}</Card><Card><div className="card-head"><div><h3>Prediction</h3><p>Live result from the trained backend model.</p></div></div><RiskResult data={res} type="supplier"/></Card></div></Page>}
function Demand(){const [f,setF]=useState({store_id:'STORE_1',item_id:'ITEM_A_FOODS',horizon_days:14,assumed_sell_price:'',assumed_promotion:false}),[res,setRes]=useState(null),[busy,setBusy]=useState(false),[err,setErr]=useState('');const [history,setHistory]=useState([]);useEffect(()=>{api.m5().then(r=>setHistory(r.data)).catch(()=>{})},[]);const submit=e=>{e.preventDefault();setBusy(true);setErr('');const x={...f,horizon_days:+f.horizon_days,assumed_sell_price:f.assumed_sell_price===''?null:+f.assumed_sell_price};api.forecast(x).then(r=>setRes(r.data)).catch(e=>setErr(e.response?.data?.detail||'Forecast failed.')).finally(()=>setBusy(false))};const stats=useMemo(()=>{if(!res?.forecast?.length)return null;const a=res.forecast.map(x=>x.forecast_units);return {avg:a.reduce((x,y)=>x+y,0)/a.length,max:Math.max(...a),min:Math.min(...a),total:a.reduce((x,y)=>x+y,0)}},[res]);return <Page title="Demand Forecast" sub="Generate future demand using the trained M5-style forecasting model."><div className="workspace demand"><Card><div className="card-head"><div><h3>Forecast Setup</h3><p>Choose a series and forecasting assumptions.</p></div></div><form onSubmit={submit} className="form-grid one"> <FormField label="Store ID"><input value={f.store_id} onChange={e=>setF({...f,store_id:e.target.value})} required/></FormField><FormField label="Item ID"><input value={f.item_id} onChange={e=>setF({...f,item_id:e.target.value})} required/></FormField><FormField label="Forecast Horizon (1–28 days)"><input type="number" min="1" max="28" value={f.horizon_days} onChange={e=>setF({...f,horizon_days:e.target.value})}/></FormField><FormField label="Assumed Sell Price (optional)"><input type="number" step="any" value={f.assumed_sell_price} onChange={e=>setF({...f,assumed_sell_price:e.target.value})}/></FormField><label className="check"><input type="checkbox" checked={f.assumed_promotion} onChange={e=>setF({...f,assumed_promotion:e.target.checked})}/> Assume promotion</label><button className="primary full" disabled={busy}>{busy?'Generating…':'Generate Demand Forecast'}</button></form>{err&&<div className="error">{err}</div>}</Card><Card className="forecast-card"><div className="card-head"><div><h3>Forecast Output</h3><p>Actual forecast returned by the FastAPI model.</p></div></div>{res?<><div className="mini-metrics"><Metric label="Average" value={stats.avg.toFixed(1)} sub="units/day" icon={TrendingUp}/><Metric label="Peak" value={stats.max.toFixed(1)} sub="units" icon={Activity}/><Metric label="Minimum" value={stats.min.toFixed(1)} sub="units" icon={PackageSearch}/><Metric label="Total" value={stats.total.toFixed(0)} sub="forecast units" icon={Truck}/></div><div className="chart"><ResponsiveContainer width="100%" height={330}><LineChart data={res.forecast}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Line type="monotone" dataKey="forecast_units" name="Forecast Units" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div><div className="assumption">Model: <b>{pretty(res.model_used)}</b> · Price: <b>{res.assumptions?.sell_price_assumed}</b> · Promotion: <b>{String(res.assumptions?.promotion_assumed)}</b></div></>:<div className="result-empty"><TrendingUp size={34}/><p>Generate a forecast to see the demand curve.</p></div>}</Card></div></Page>}
function Decision(){
  const nav=useNavigate();
  const [d,setD]=useState(null),[s,setS]=useState(null),[m,setM]=useState(null);
  useEffect(()=>{
    const load=()=>{
      try{
        setD(JSON.parse(sessionStorage.getItem('last_dataco')||'null'));
        setS(JSON.parse(sessionStorage.getItem('last_scms')||'null'));
        setM(JSON.parse(sessionStorage.getItem('last_m5')||'null'));
      }catch{}
    };
    load();
    window.addEventListener('storage',load);
    return()=>window.removeEventListener('storage',load);
  },[]);

  const dp=typeof d?.late_probability==='number'?d.late_probability:null;
  const sp=typeof s?.delay_probability==='number'?s.delay_probability:null;
  const demand=m?.forecast?.map(x=>Number(x.forecast_units)||0)||[];
  const first=demand.slice(0,Math.min(7,demand.length));
  const last=demand.slice(-Math.min(7,demand.length));
  const firstAvg=first.length?first.reduce((a,b)=>a+b,0)/first.length:0;
  const lastAvg=last.length?last.reduce((a,b)=>a+b,0)/last.length:0;
  const demandChange=firstAvg?((lastAvg-firstAvg)/firstAvg):0;
  let trend='No forecast yet';
  if(demand.length>1) trend=demandChange>.05?'Increasing':demandChange<-.05?'Decreasing':'Stable';

  const riskLevel=p=>p==null?'Not run':p>=.7?'High':p>=.4?'Medium':'Low';
  const deliveryLevel=riskLevel(dp), supplierLevel=riskLevel(sp);
  const demandLevel=trend==='Increasing'?'High':trend==='Stable'?'Medium':trend==='Decreasing'?'Low':'Not run';
  const trendScore=trend==='Increasing'?75:trend==='Stable'?45:trend==='Decreasing'?20:0;
  const available=[dp,sp,m].filter(Boolean).length;
  const pressure=available?Math.round((dp==null?0:dp*100*.35)+(sp==null?0:sp*100*.35)+(m?trendScore*.30:0)):0;
  const pressureLabel=pressure>=70?'High':pressure>=45?'Medium':available?'Low':'Awaiting analyses';

  const drivers=[];
  if(d) drivers.push({icon:Truck,title:'Delivery signal',value:`${fmtPct(dp)} · ${d.prediction}`,detail:dp>=.6?'Late-delivery exposure is elevated for the analyzed order.':'The analyzed order is not currently flagged as high late-delivery exposure.',danger:dp>=.6});
  if(s) drivers.push({icon:Siren,title:'Supplier signal',value:`${fmtPct(sp)} · ${s.prediction}`,detail:sp>=.6?'Shipment-delay exposure is elevated for the analyzed supplier/shipment.':'The analyzed shipment is not currently flagged as high delay exposure.',danger:sp>=.6});
  if(m) drivers.push({icon:TrendingUp,title:'Demand signal',value:`${trend} · ${m.store_id} / ${m.item_id}`,detail:`Average forecast changes ${demandChange>=0?'+':''}${(demandChange*100).toFixed(1)}% from the first forecast window to the last.`,danger:trend==='Increasing'});

  const actions=[];
  if(dp>=.6) actions.push({priority:'Immediate',title:'Protect the inbound order',text:'Confirm the delivery ETA and consider expediting or prioritizing the affected order.',icon:Truck});
  if(sp>=.6) actions.push({priority:'Immediate',title:'Escalate supplier follow-up',text:'Request an updated shipment commitment and review alternate sourcing if the item is critical.',icon:Siren});
  if(trend==='Increasing') actions.push({priority:'Planning',title:'Protect inventory for rising demand',text:'Review available stock, replenishment timing and safety-stock coverage for the forecast horizon.',icon:PackageSearch});
  if(sp>=.6 && trend==='Increasing') actions.push({priority:'High',title:'Secure an alternate supply path',text:'Rising demand combined with supplier delay exposure creates a stronger need for backup sourcing or allocation planning.',icon:GitCompare});
  if(dp>=.6 && trend==='Increasing') actions.push({priority:'High',title:'Prioritize fulfillment capacity',text:'Align inbound timing and available inventory with the higher projected demand period.',icon:Activity});
  if(!actions.length && available){
    actions.push({priority:'Monitor',title:'Continue routine monitoring',text:'No major combined disruption trigger is present in the latest available signals. Re-run the analyses when order, supplier or demand assumptions change.',icon:ShieldCheck});
  }

  let headline='Awaiting enough signals for a combined decision';
  let summary='Run the delivery, supplier and demand analyses to build a complete disruption picture.';
  if(available){
    if(dp>=.6 && sp>=.6 && trend==='Increasing'){
      headline='Coordinated disruption response';
      summary='All three signals point toward higher operational pressure. Protect inbound supply, escalate the supplier and secure inventory against the rising demand outlook.';
    }else if((sp>=.6 && trend==='Increasing') || (dp>=.6 && trend==='Increasing')){
      headline='Protect supply against demand pressure';
      summary='A risk signal is elevated while forecast demand is increasing. Prioritize supply continuity and inventory coverage for the selected item/order.';
    }else if(dp>=.6 && sp>=.6){
      headline='Inbound disruption requires attention';
      summary='Both delivery and supplier delay exposure are elevated. Validate the shipment plan before execution and prepare a contingency path.';
    }else if(dp>=.6 || sp>=.6){
      headline='Targeted disruption response';
      summary='One supply-chain risk signal is elevated. Focus the response on the affected order or supplier while continuing to monitor the other signals.';
    }else if(trend==='Increasing'){
      headline='Demand-led planning response';
      summary='The current risk signals are not elevated, but demand is increasing. Use the forecast to plan replenishment and inventory coverage.';
    }else{
      headline='Stable operating picture';
      summary='The latest available signals do not show a major combined disruption trigger. Continue routine monitoring and update the analyses as conditions change.';
    }
  }

  const missing=[!d&&['Delivery Risk','/delivery-risk',Truck],!s&&['Supplier Risk','/supplier-risk',Siren],!m&&['Demand Forecast','/demand-forecast',TrendingUp]].filter(Boolean);

  return <Page title="Decision Center" sub="Convert delivery, supplier and demand signals into a transparent disruption response plan.">
    <Card className="decision-hero">
      <div className="decision-hero-main">
        <span className="tag">SUPPLY CHAIN DISRUPTION DECISION SUPPORT</span>
        <h2>{headline}</h2>
        <p>{summary}</p>
      </div>
      <div className={'pressure-ring '+(pressureLabel.toLowerCase().replaceAll(' ','-'))}><strong>{available?pressure:'—'}</strong><span>{available?'Pressure':'Signals'}</span></div>
    </Card>

    <div className="grid three decision-signals">
      <Metric label="Delivery Risk" value={d?fmtPct(dp):'Not run'} sub={d?`${deliveryLevel} · ${d.prediction}`:'Run delivery analysis'} icon={Truck}/>
      <Metric label="Supplier Risk" value={s?fmtPct(sp):'Not run'} sub={s?`${supplierLevel} · ${s.prediction}`:'Run supplier analysis'} icon={Siren}/>
      <Metric label="Demand Outlook" value={trend} sub={m?`${m.store_id} · ${m.item_id}`:'Run demand forecast'} icon={TrendingUp}/>
    </div>

    {missing.length>0&&<Card className="missing-card"><div><h3>Complete the decision picture</h3><p>{available?'Some signals are still missing. Run them to make the combined assessment more complete.':'The Decision Center uses the latest results stored by the three analysis pages.'}</p></div><div className="missing-actions">{missing.map(([label,to,I])=><button key={to} className="secondary small-btn" onClick={()=>nav(to)}><I size={15}/>{label}<ArrowRight size={14}/></button>)}</div></Card>}

    <div className="decision-layout">
      <Card>
        <div className="card-head"><div><h3>Decision Drivers</h3><p>Actual outputs from the three analytical modules.</p></div></div>
        {drivers.length?<div className="driver-list">{drivers.map(({icon:I,title,value,detail,danger})=><div className={'driver '+(danger?'danger':'')} key={title}><div className="driver-icon"><I size={18}/></div><div><b>{title}</b><strong>{value}</strong><span>{detail}</span></div></div>)}</div>:<div className="empty compact"><GitCompare/><p>Run an analysis to populate the decision drivers.</p></div>}
      </Card>

      <Card>
        <div className="card-head"><div><h3>Recommended Actions</h3><p>Operational actions triggered by the combined signals.</p></div></div>
        {actions.length?<div className="recommendations">{actions.map((a,i)=>{const I=a.icon;return <div className={'recommendation '+(a.priority==='Immediate'?'immediate':'')} key={a.title}><div className="rec-number">{i+1}</div><div className="rec-icon"><I size={17}/></div><div><span className="rec-priority">{a.priority}</span><b>{a.title}</b><p>{a.text}</p></div></div>})}</div>:<div className="empty compact"><AlertTriangle/><p>Run the analyses to generate action recommendations.</p></div>}
      </Card>
    </div>

    <Card>
      <div className="card-head"><div><h3>Disruption Pressure Logic</h3><p>A transparent decision-support heuristic — not a replacement for the individual ML model outputs.</p></div><span className="badge good">{available}/3 signals available</span></div>
      <div className="logic-grid">
        <div><span>Delivery contribution</span><strong>{dp==null?'—':`${Math.round(dp*35)} / 35`}</strong><small>35% weight</small></div>
        <div><span>Supplier contribution</span><strong>{sp==null?'—':`${Math.round(sp*35)} / 35`}</strong><small>35% weight</small></div>
        <div><span>Demand contribution</span><strong>{m?`${Math.round(trendScore*.30)} / 30`:'—'}</strong><small>30% weight</small></div>
        <div className="logic-total"><span>Combined pressure</span><strong>{available?`${pressure} / 100`:'—'}</strong><small>{pressureLabel}</small></div>
      </div>
      <div className="assumption decision-note">The combined pressure is calculated only from the latest available session results. Delivery and supplier probabilities contribute directly; demand contributes according to forecast direction (increasing, stable or decreasing). This makes the recommendation explainable and easy to discuss during review.</div>
    </Card>
  </Page>
}
function ModelInsights(){const [data,setData]=useState(null),[imb,setImb]=useState(null);useEffect(()=>{Promise.all([api.models(),api.imbalance()]).then(([a,b])=>{setData(a.data);setImb(b.data)}).catch(()=>{})},[]);const chart=(arr,key)=>arr?.map(x=>({...x,name:pretty(x.model||x.imbalance_strategy),value:x[key]}));return <Page title="Model Insights" sub="Technical evidence behind the operational predictions and forecasts."><div className="grid three"><Card><h3>DataCo</h3><p className="muted">Delivery classification</p><div className="chart small"><ResponsiveContainer><BarChart data={chart(data?.dataco,'f1')}><XAxis dataKey="name" hide/><YAxis/><Tooltip/><Bar dataKey="value" name="F1"/></BarChart></ResponsiveContainer></div></Card><Card><h3>SCMS</h3><p className="muted">Supplier/shipment classification</p><div className="chart small"><ResponsiveContainer><BarChart data={chart(data?.scms,'f1')}><XAxis dataKey="name" hide/><YAxis/><Tooltip/><Bar dataKey="value" name="F1"/></BarChart></ResponsiveContainer></div></Card><Card><h3>M5</h3><p className="muted">Demand forecasting</p><div className="chart small"><ResponsiveContainer><BarChart data={data?.m5?.map(x=>({...x,name:pretty(x.model),value:x.mae}))}><XAxis dataKey="name" hide/><YAxis/><Tooltip/><Bar dataKey="value" name="MAE"/></BarChart></ResponsiveContainer></div></Card></div><Card><div className="card-head"><div><h3>SCMS Imbalance Analysis</h3><p>Actual strategy comparison from the backend experiment.</p></div></div><div className="chart"><ResponsiveContainer width="100%" height={320}><BarChart data={imb?.summary_by_strategy?.map(x=>({...x,name:pretty(x.imbalance_strategy)}))}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/><Bar dataKey="recall" name="Recall"/><Bar dataKey="f1" name="F1"/></BarChart></ResponsiveContainer></div></Card></Page>}
function Reports(){
  const [data,setData]=useState({delivery:null,supplier:null,demand:null});
  useEffect(()=>{
    const read=k=>{try{return JSON.parse(sessionStorage.getItem(k)||'null')}catch{return null}};
    const load=()=>setData({delivery:read('last_dataco'),supplier:read('last_scms'),demand:read('last_m5')});
    load();
    const id=setInterval(load,500);
    return()=>clearInterval(id);
  },[]);
  const {delivery:d,supplier:s,demand:m}=data;
  const dp=d?.late_probability ?? null;
  const sp=s?.delay_probability ?? null;
  const forecast=m?.forecast||[];
  const values=forecast.map(x=>Number(x.forecast_units)).filter(Number.isFinite);
  const avg=values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
  const peak=values.length?Math.max(...values):null;
  const min=values.length?Math.min(...values):null;
  const total=values.length?values.reduce((a,b)=>a+b,0):null;
  const split=Math.max(1,Math.floor(values.length/2));
  const first=values.slice(0,split),last=values.slice(-split);
  const firstAvg=first.length?first.reduce((a,b)=>a+b,0)/first.length:null;
  const lastAvg=last.length?last.reduce((a,b)=>a+b,0)/last.length:null;
  const change=firstAvg&&lastAvg?((lastAvg-firstAvg)/firstAvg)*100:null;
  const trend=change==null?'—':change>5?'Increasing':change<-5?'Decreasing':'Stable';
  const deliveryLevel=dp==null?'Not run':dp>=.6?'High':dp>=.3?'Medium':'Low';
  const supplierLevel=sp==null?'Not run':sp>=.6?'High':sp>=.3?'Medium':'Low';
  const demandScore=trend==='Increasing'?100:trend==='Stable'?45:15;
  const pressure=(dp!=null&&sp!=null&&m)?Math.round(dp*35+sp*35+demandScore*.30):null;
  const pressureLabel=pressure==null?'Incomplete':pressure>=70?'High':pressure>=40?'Medium':'Low';
  const available=[d,s,m].filter(Boolean).length;
  const generatedAt=new Date().toLocaleString();

  const actionSummary=()=>{
    const a=[];
    if(sp!=null&&sp>=.6)a.push('Escalate supplier follow-up and confirm the shipment commitment.');
    if(dp!=null&&dp>=.6)a.push('Protect the affected inbound order through ETA confirmation or expedited handling.');
    if(trend==='Increasing')a.push('Review inventory coverage and consider replenishment or safety-stock protection.');
    if(sp!=null&&sp>=.6&&trend==='Increasing')a.push('Evaluate alternate sourcing because supplier delay exposure coincides with rising demand.');
    if(!a.length)a.push('Continue routine monitoring and refresh the three analyses when new supply-chain data becomes available.');
    return a;
  };

  const downloadText=(filename,text,type='text/plain')=>{
    const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  };
  const htmlEscape=x=>String(x??'—').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const downloadDecisionBrief=()=>{
    const actions=actionSummary();
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>Supply Chain Decision Brief</title><style>body{font-family:Arial,sans-serif;color:#172033;max-width:900px;margin:40px auto;line-height:1.5}h1{margin-bottom:4px}h2{margin-top:28px}.meta{color:#667085;font-size:13px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.box{border:1px solid #dfe5ed;border-radius:10px;padding:14px}.value{font-size:22px;font-weight:700}.high{color:#b42318}.medium{color:#a15c00}.low{color:#137333}li{margin:8px 0}</style></head><body><h1>Supply Chain Disruption Decision Brief</h1><div class="meta">Generated ${htmlEscape(generatedAt)} · ${available}/3 analytical signals available</div><h2>Current Assessment</h2><div class="grid"><div class="box"><b>Delivery Risk</b><div class="value">${htmlEscape(d?fmtPct(dp):'Not run')}</div><div>${htmlEscape(d?.prediction||'—')}</div></div><div class="box"><b>Supplier Risk</b><div class="value">${htmlEscape(s?fmtPct(sp):'Not run')}</div><div>${htmlEscape(s?.prediction||'—')}</div></div><div class="box"><b>Demand Outlook</b><div class="value">${htmlEscape(trend)}</div><div>${htmlEscape(m?`${m.store_id} / ${m.item_id}`:'Not run')}</div></div></div><h2>Combined Disruption Pressure</h2><p class="value">${htmlEscape(pressure==null?'Incomplete':`${pressure}/100 — ${pressureLabel}`)}</p><p>This combined pressure is a transparent decision-support heuristic using the latest available delivery, supplier and demand outputs. It does not replace the individual ML predictions.</p><h2>Recommended Actions</h2><ol>${actions.map(x=>`<li>${htmlEscape(x)}</li>`).join('')}</ol><h2>Demand Planning Snapshot</h2><p>Average: ${htmlEscape(avg?.toFixed(1))} units/day · Peak: ${htmlEscape(peak?.toFixed(1))} · Minimum: ${htmlEscape(min?.toFixed(1))} · Total: ${htmlEscape(total?.toFixed(0))} forecast units · Outlook: ${htmlEscape(trend)}</p><h2>Decision Drivers</h2><ul><li>Delivery signal: ${htmlEscape(d?`${fmtPct(dp)} · ${d.prediction}`:'Not available')}</li><li>Supplier signal: ${htmlEscape(s?`${fmtPct(sp)} · ${s.prediction}`:'Not available')}</li><li>Demand signal: ${htmlEscape(m?`${trend} · ${change?.toFixed(1)}% first-to-last window change`:'Not available')}</li></ul></body></html>`;
    downloadText('supply-chain-decision-brief.html',html,'text/html');
  };
  const downloadCSV=()=>{
    const rows=[['Report','Metric','Value'],['Delivery Risk','Prediction',d?.prediction||'Not run'],['Delivery Risk','Late Probability',d?fmtPct(dp):'Not run'],['Delivery Risk','Model',d?.model_used||'—'],['Supplier Risk','Prediction',s?.prediction||'Not run'],['Supplier Risk','Delay Probability',s?fmtPct(sp):'Not run'],['Supplier Risk','Model',s?.model_used||'—'],['Demand Forecast','Store / Item',m?`${m.store_id} / ${m.item_id}`:'Not run'],['Demand Forecast','Outlook',trend],['Demand Forecast','Average Units/Day',avg?.toFixed(2)||'—'],['Demand Forecast','Peak Units',peak?.toFixed(2)||'—'],['Demand Forecast','Minimum Units',min?.toFixed(2)||'—'],['Demand Forecast','Total Forecast Units',total?.toFixed(2)||'—'],['Decision Center','Combined Pressure',pressure==null?'Incomplete':`${pressure}/100`],['Decision Center','Pressure Level',pressureLabel],['Decision Center','Signals Available',`${available}/3`]];
    downloadText('supply-chain-analysis.csv',rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n'),'text/csv');
  };
  const reportCards=[
    {icon:TriangleAlert,title:'Disruption Decision Brief',text:'Combines the latest delivery, supplier and demand signals into a management-ready response plan.',status:available===3?'Ready':'Partial',action:downloadDecisionBrief,label:'Download Brief'},
    {icon:ClipboardList,title:'Delivery Exception Report',text:'Summarizes late-delivery probability, prediction status and model used for the latest order.',status:d?'Available':'Run analysis',action:()=>{},label:'View on page'},
    {icon:PackageCheck,title:'Supplier Risk Report',text:'Highlights supplier delay probability and the operational exposure that requires follow-up.',status:s?'Available':'Run analysis',action:()=>{},label:'View on page'},
    {icon:CalendarRange,title:'Demand Planning Report',text:'Summarizes forecast horizon, average demand, peak requirement, minimum requirement and trend.',status:m?'Available':'Run analysis',action:()=>{},label:'View on page'},
  ];

  return <Page title="Reports" sub="Turn the latest AI analyses into useful operational and management reports.">
    <Card className="report-command">
      <div><span className="tag">OPERATIONAL REPORTING</span><h2>From predictions to management-ready evidence.</h2><p>Generate a concise disruption brief or export the latest analytical results for further analysis.</p></div>
      <div className="report-actions"><button className="primary" onClick={downloadDecisionBrief}><Download size={15}/>Download Decision Brief</button><button className="secondary report-secondary" onClick={downloadCSV}><Database size={15}/>Export Analysis CSV</button></div>
    </Card>

    <div className="grid four report-metrics">
      <Metric label="Signals Available" value={`${available}/3`} sub="Latest session analyses" icon={FileBarChart2}/>
      <Metric label="Disruption Pressure" value={pressure==null?'—':`${pressure}/100`} sub={pressureLabel} icon={TriangleAlert}/>
      <Metric label="Supplier Risk" value={s?fmtPct(sp):'—'} sub={s?.prediction||'Not run'} icon={PackageCheck}/>
      <Metric label="Demand Outlook" value={trend} sub={m?`${m.store_id} · ${m.item_id}`:'Not run'} icon={TrendingUp}/>
    </div>

    <div className="grid two report-grid">
      {reportCards.map(({icon:I,title,text,status,action,label})=><Card key={title} className="report-card"><div className="report-icon"><I size={20}/></div><div><h3>{title}</h3><p>{text}</p><span className={status==='Ready'||status==='Available'?'badge good':'badge'}>{status}</span></div><button className="secondary small-btn" onClick={action}>{title==='Disruption Decision Brief'?<Download size={14}/>:<FileText size={14}/>} {label}</button></Card>)}
    </div>

    <div className="grid two report-grid">
      <Card><div className="card-head"><div><h3>Delivery Exception Snapshot</h3><p>Latest DataCo analysis.</p></div></div>{d?<div className="report-detail-grid"><div><span>Status</span><strong>{d.prediction}</strong></div><div><span>Late probability</span><strong>{fmtPct(dp)}</strong></div><div><span>Model</span><strong>{pretty(d.model_used)}</strong></div><div><span>Strategy</span><strong>{pretty(d.imbalance_strategy_used)}</strong></div></div>:<div className="empty compact"><Truck/><p>Run Delivery Risk to populate this report.</p></div>}</Card>
      <Card><div className="card-head"><div><h3>Supplier Exposure Snapshot</h3><p>Latest SCMS analysis.</p></div></div>{s?<div className="report-detail-grid"><div><span>Status</span><strong>{s.prediction}</strong></div><div><span>Delay probability</span><strong>{fmtPct(sp)}</strong></div><div><span>Model</span><strong>{pretty(s.model_used)}</strong></div><div><span>Strategy</span><strong>{pretty(s.imbalance_strategy_used)}</strong></div></div>:<div className="empty compact"><Siren/><p>Run Supplier Risk to populate this report.</p></div>}</Card>
    </div>

    <Card><div className="card-head"><div><h3>Demand Planning Snapshot</h3><p>Latest M5 forecast returned by the backend.</p></div></div>{m?<><div className="mini-metrics"><Metric label="Average" value={`${avg?.toFixed(1)} units/day`} sub="Forecast mean" icon={TrendingUp}/><Metric label="Peak" value={`${peak?.toFixed(1)} units`} sub="Maximum forecast" icon={TriangleAlert}/><Metric label="Minimum" value={`${min?.toFixed(1)} units`} sub="Minimum forecast" icon={PackageCheck}/><Metric label="Total" value={`${total?.toFixed(0)} units`} sub={`${forecast.length}-day forecast`} icon={CalendarRange}/></div><div className="assumption report-trend"><b>Demand outlook: {trend}</b><span>{change==null?'Trend unavailable':`${change.toFixed(1)}% change from the first forecast window to the last.`}</span></div></>:<div className="empty compact"><TrendingUp/><p>Run Demand Forecast to populate this report.</p></div>}</Card>

    <Card><div className="card-head"><div><h3>Management Decision Summary</h3><p>Use this section as the executive takeaway from the latest three signals.</p></div></div><div className="decision-report-summary"><div><span>Current pressure</span><strong>{pressure==null?'Incomplete':`${pressure}/100 · ${pressureLabel}`}</strong></div><div><span>Primary concern</span><strong>{sp!=null&&sp>=.6?'Supplier delay exposure':dp!=null&&dp>=.6?'Delivery delay exposure':trend==='Increasing'?'Demand growth':'No dominant trigger'}</strong></div><div><span>Recommended focus</span><strong>{actionSummary()[0]}</strong></div></div><p className="assumption">This report is generated from the latest results stored in the browser session. It is intended for operational decision support; refresh the underlying analyses when new data becomes available.</p></Card>
  </Page>
}
function Persistor(){return null}
function Capture(){useEffect(()=>{const orig=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){orig.call(this,k,v)};return()=>{Storage.prototype.setItem=orig}},[]);return null}
function App(){return <Shell><Routes><Route path="/" element={<Dashboard/>}/><Route path="/delivery-risk" element={<Delivery/>}/><Route path="/supplier-risk" element={<Supplier/>}/><Route path="/demand-forecast" element={<Demand/>}/><Route path="/decision-center" element={<Decision/>}/><Route path="/reports" element={<Reports/>}/><Route path="/model-insights" element={<ModelInsights/>}/><Route path="*" element={<Dashboard/>}/></Routes></Shell>}

// Persist latest prediction/forecast without changing backend behavior.
const oldDataco=api.datacoPredict; api.datacoPredict=async x=>{const r=await oldDataco(x);sessionStorage.setItem('last_dataco',JSON.stringify(r.data));return r};
const oldScms=api.scmsPredict; api.scmsPredict=async x=>{const r=await oldScms(x);sessionStorage.setItem('last_scms',JSON.stringify(r.data));return r};
const oldForecast=api.forecast; api.forecast=async x=>{const r=await oldForecast(x);sessionStorage.setItem('last_m5',JSON.stringify(r.data));return r};
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
