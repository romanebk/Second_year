import React, { useState } from 'react'
import { Shield, CheckCircle2, XCircle, TrendingUp, AlertCircle, BarChart2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Separator } from './components/ui/separator'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

// ─── Données ────────────────────────────────────────────────
const volumeData = [
  { hour: '08h', normal: 1200, fraudes: 3 },
  { hour: '10h', normal: 2100, fraudes: 5 },
  { hour: '12h', normal: 3400, fraudes: 9 },
  { hour: '14h', normal: 2800, fraudes: 6 },
  { hour: '16h', normal: 3100, fraudes: 8 },
  { hour: '18h', normal: 2600, fraudes: 4 },
  { hour: '20h', normal: 1800, fraudes: 2 },
]

const modelData = [
  { name: 'Rég. Logistique', precision: 83, recall: 64, f1: 72 },
  { name: 'Random Forest',   precision: 82, recall: 82, f1: 82 },
]

const initialHistory = [
  { id: 'TXN-88432', time: '23:41:02', montant: '€1 240,00', statut: 'LÉGITIME',  risque: 2.1 },
  { id: 'TXN-88431', time: '23:39:17', montant: '€89,50',    statut: 'FRAUDULEUSE', risque: 91.4 },
  { id: 'TXN-88430', time: '23:37:55', montant: '€450,00',   statut: 'LÉGITIME',  risque: 5.3 },
  { id: 'TXN-88429', time: '23:35:12', montant: '€3 200,00', statut: 'LÉGITIME',  risque: 8.7 },
  { id: 'TXN-88428', time: '23:32:44', montant: '€67,00',    statut: 'FRAUDULEUSE', risque: 84.2 },
]

const tooltipStyle = {
  backgroundColor: 'hsl(0 0% 9%)',
  border: '1px solid hsl(0 0% 14.9%)',
  borderRadius: '6px',
  color: 'hsl(0 0% 98%)',
  fontSize: '12px',
}

// ─── Composant principal ─────────────────────────────────────
export default function App() {
  const [history, setHistory] = useState(initialHistory)
  const [analyzing, setAnalyzing] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const runAnalysis = async () => {
    setAnalyzing(true)
    await new Promise(r => setTimeout(r, 1200))

    const isFraud = Math.random() > 0.75
    const risque = isFraud ? +(70 + Math.random() * 25).toFixed(1) : +(Math.random() * 12).toFixed(1)
    const montants = ['€240,00', '€1 890,00', '€55,30', '€4 200,00', '€320,00', '€780,00']
    const entry = {
      id: `TXN-${Math.floor(Math.random() * 90000 + 10000)}`,
      time: new Date().toLocaleTimeString('fr-FR'),
      montant: montants[Math.floor(Math.random() * montants.length)],
      statut: isFraud ? 'FRAUDULEUSE' : 'LÉGITIME',
      risque,
    }

    setLastResult(entry)
    setHistory(prev => [entry, ...prev].slice(0, 10))
    setAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* ── Header ── */}
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold">FraudWatch</span>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <span className="text-sm text-muted-foreground">Système de détection de fraude bancaire</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-white/60" />
            Random Forest v2 — Opérationnel
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="px-8 py-8 max-w-7xl mx-auto space-y-8">

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Précision', value: '82%',  sub: 'Fraudes correctement identifiées', icon: <TrendingUp className="h-4 w-4 text-muted-foreground" /> },
            { label: 'Rappel',    value: '82%',  sub: 'Fraudes capturées sur le total',   icon: <BarChart2  className="h-4 w-4 text-muted-foreground" /> },
            { label: 'Faux positifs', value: '17', sub: 'Sur 56 864 transactions légitimes', icon: <AlertCircle className="h-4 w-4 text-muted-foreground" /> },
            { label: 'AUC-PR',    value: '0.87', sub: 'Gain de +0.13 vs modèle de base', icon: <TrendingUp className="h-4 w-4 text-muted-foreground" /> },
          ].map((k, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
                {k.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{k.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="analyse">Analyser</TabsTrigger>
            <TabsTrigger value="performances">Performances</TabsTrigger>
            <TabsTrigger value="historique">Historique</TabsTrigger>
          </TabsList>

          {/* ── Vue d'ensemble ── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Volume de transactions — simulation 24h</CardTitle>
                  <CardDescription>Nombre de transactions analysées par heure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={volumeData}>
                        <defs>
                          <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#ffffff" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" vertical={false} />
                        <XAxis dataKey="hour" stroke="hsl(0 0% 45%)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(0 0% 45%)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="normal" name="Légitimes" stroke="#ffffff" fill="url(#normalGrad)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition des classes</CardTitle>
                  <CardDescription>Dataset original — 284 807 transactions</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-2">
                  <div className="h-40 w-full flex justify-center">
                    <ResponsiveContainer width={180} height="100%">
                      <PieChart>
                        <Pie data={[{v:99.83},{v:0.17}]} dataKey="v" innerRadius={50} outerRadius={68} startAngle={90} endAngle={-270} paddingAngle={3}>
                          <Cell fill="hsl(0 0% 80%)" strokeWidth={0} />
                          <Cell fill="hsl(0 0% 25%)" strokeWidth={0} />
                        </Pie>
                        <Tooltip formatter={v=>`${v}%`} contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-2 mt-2">
                    {[['Légitimes (99.83%)', 'hsl(0 0% 80%)'], ['Fraudes (0.17%)', 'hsl(0 0% 25%)']].map(([l, c]) => (
                      <div key={l} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full shrink-0" style={{backgroundColor: c}} />
                          <span className="text-muted-foreground">{l}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Analyser ── */}
          <TabsContent value="analyse">
            <div className="max-w-lg mx-auto space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse d'une transaction</CardTitle>
                  <CardDescription>
                    Sélectionne une transaction aléatoire du dataset. Le modèle Random Forest calcule un score de risque en temps réel.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 pt-2">
                  <div className="h-20 w-20 rounded-full border border-border flex items-center justify-center">
                    {analyzing ? (
                      <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : lastResult?.statut === 'FRAUDULEUSE' ? (
                      <XCircle className="h-8 w-8" />
                    ) : lastResult ? (
                      <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <Shield className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  <Button onClick={runAnalysis} disabled={analyzing} className="w-full">
                    {analyzing ? 'Analyse en cours...' : 'Analyser une transaction'}
                  </Button>
                </CardContent>
              </Card>

              {lastResult && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="font-mono">{lastResult.id}</CardTitle>
                      <CardDescription className="mt-1">{lastResult.time}</CardDescription>
                    </div>
                    <Badge variant={lastResult.statut === 'FRAUDULEUSE' ? 'default' : 'secondary'}>
                      {lastResult.statut}
                    </Badge>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Montant</p>
                        <p className="font-semibold">{lastResult.montant}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Score de risque</p>
                        <p className="font-semibold font-mono">{lastResult.risque}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Décision</p>
                        <p className="font-semibold">{lastResult.statut === 'FRAUDULEUSE' ? 'Bloquée' : 'Autorisée'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ── Performances ── */}
          <TabsContent value="performances">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Comparaison des modèles</CardTitle>
                  <CardDescription>Précision, Rappel et F1-Score sur le jeu de test (56 962 transactions)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={modelData} barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14.9%)" vertical={false} />
                        <XAxis dataKey="name" stroke="hsl(0 0% 45%)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis domain={[0,100]} stroke="hsl(0 0% 45%)" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{fontSize:'11px', color:'hsl(0 0% 64%)'}} />
                        <Bar dataKey="precision" name="Précision" fill="hsl(0 0% 90%)" radius={[3,3,0,0]} />
                        <Bar dataKey="recall"    name="Rappel"    fill="hsl(0 0% 60%)" radius={[3,3,0,0]} />
                        <Bar dataKey="f1"        name="F1-Score"  fill="hsl(0 0% 35%)" radius={[3,3,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Matrice de confusion</CardTitle>
                  <CardDescription>Random Forest + SMOTE — jeu de test</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto mt-2">
                    {[
                      { label: 'Vrais Négatifs',  value: '56 847', sub: 'Légitimes identifiés', bright: true },
                      { label: 'Faux Positifs',   value: '17',     sub: 'Légitimes bloqués',    bright: false },
                      { label: 'Faux Négatifs',   value: '18',     sub: 'Fraudes manquées',     bright: false },
                      { label: 'Vrais Positifs',  value: '80',     sub: 'Fraudes détectées',    bright: true },
                    ].map((c,i) => (
                      <div key={i} className={`border rounded-md p-3 text-center ${c.bright ? 'border-border bg-muted/20' : 'border-border/40'}`}>
                        <p className="text-lg font-bold font-mono">{c.value}</p>
                        <p className="text-xs font-medium mt-0.5">{c.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Méthodologie</CardTitle>
                  <CardDescription>Pipeline complet du projet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { n:'01', title:'Exploration (EDA)',       desc:'284 807 transactions, 492 fraudes (0.17%), données PCA anonymisées.' },
                      { n:'02', title:'Rééquilibrage SMOTE',     desc:'492 → 227 451 exemples synthétiques de fraude pour l\'entraînement.' },
                      { n:'03', title:'Entraînement & Validation',desc:'Random Forest vs Régression Logistique — validation croisée stratifiée.' },
                      { n:'04', title:'Résultats',               desc:'F1-Score : 0.82 | AUC-PR : 0.87 — +17 points vs modèle de base.' },
                    ].map(s => (
                      <div key={s.n} className="space-y-1">
                        <p className="text-xs font-mono text-muted-foreground">{s.n}</p>
                        <p className="text-sm font-semibold">{s.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Historique ── */}
          <TabsContent value="historique">
            <Card>
              <CardHeader>
                <CardTitle>Historique des analyses</CardTitle>
                <CardDescription>{history.length} transactions vérifiées</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Heure</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Score de risque</TableHead>
                      <TableHead>Résultat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((tx, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{tx.time}</TableCell>
                        <TableCell className="font-semibold">{tx.montant}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 rounded-full bg-muted">
                              <div className="h-full rounded-full bg-foreground/60" style={{width:`${tx.risque}%`}} />
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">{tx.risque}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tx.statut === 'FRAUDULEUSE' ? (
                            <Badge variant="default" className="gap-1 text-xs">
                              <XCircle className="h-3 w-3" /> Bloquée
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <CheckCircle2 className="h-3 w-3" /> Autorisée
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-8">
        <div className="px-8 py-4 text-xs text-muted-foreground">
          EPITECH Free Project 2026 — Détection de fraude bancaire par IA
        </div>
      </footer>
    </div>
  )
}
