import csv, math, json
WIBOR=3.85  # WIBOR 3M ~ X-XI 2026 (GPW Benchmark via finwire/mBank)
def pmt(B, rate, n):
    i=rate/100/12
    return B*i/(1-(1+i)**-n)
rows=[]
for B in [300_000,400_000,500_000,700_000]:
  for N in [10,15,20,25]:
    n=N*12
    for m0,m1 in [(2.3,2.0),(2.3,1.8),(2.6,1.8),(2.8,1.8),(3.3,1.8)]:
      p0=pmt(B,WIBOR+m0,n); p1=pmt(B,WIBOR+m1,n)
      d=p0-p1; tot=d*n
      for label,cost in [("bez prowizji",2000),("prowizja 1%",2000+0.01*B)]:
        rows.append(dict(saldo=B,lata=N,marza_obecna=m0,marza_nowa=m1,roznica_pp=round(m0-m1,2),
          rata_obecna=round(p0),rata_nowa=round(p1),oszczednosc_mies=round(d),
          oszczednosc_calkowita_brutto=round(tot),wariant_kosztow=label,koszt_zmiany=round(cost),
          oszczednosc_netto=round(tot-cost),prog_oplacalnosci_mies=math.ceil(cost/d)))
with open('data/model-oplacalnosci-refinansowania.csv','w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)
print(len(rows))
# headline table: 400k, 20 lat
for r in rows:
  if r['saldo']==400_000 and r['lata']==20: print(r)
print('---')
for r in rows:
  if r['roznica_pp']==0.5 and r['wariant_kosztow']=='prowizja 1%': print(r['saldo'],r['lata'],r['oszczednosc_mies'],r['oszczednosc_netto'],r['prog_oplacalnosci_mies'])
