"""Fetch public GSI elevation tiles and OSM geography for the miniature asset."""
import concurrent.futures, json, math, pathlib, urllib.request, urllib.parse, urllib.error
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'reference/island-source'
OUT.mkdir(parents=True, exist_ok=True)
def fetch(url, path):
    if path.exists(): return
    req = urllib.request.Request(url, headers={'User-Agent':'RishiriMiniature/1.0 (local asset authoring)'})
    try:
        with urllib.request.urlopen(req, timeout=150) as r: data=r.read()
    except urllib.error.HTTPError as e:
        if e.code == 404 and path.suffix == '.txt':
            data=('\n'.join([','.join(['e']*256)]*256)).encode()
        else: raise
    if path.suffix == '.json': json.loads(data)
    path.write_bytes(data)
    print(path.name, len(data), flush=True)
def tile(lon, lat):
    return ((lon+180)/360*4096, (1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*4096)
x0,y0=tile(141.11,45.28); x1,y1=tile(141.36,45.09)
jobs=[]
for x in range(int(x0),int(x1)+1):
    for y in range(int(y0),int(y1)+1):
        jobs.append((f'https://cyberjapandata.gsi.go.jp/xyz/dem/12/{x}/{y}.txt', OUT/f'dem-12-{x}-{y}.txt'))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for future in [pool.submit(fetch,*j) for j in jobs]: future.result()

# The official map API is bounded to avoid its 50,000-node response limit.
import tempfile, xml.etree.ElementTree as ET
CACHE=pathlib.Path(tempfile.gettempdir()) / "rishiri-map-cache"
CACHE.mkdir(exist_ok=True)
def get(bbox):
 url='https://api.openstreetmap.org/api/0.6/map?bbox='+','.join(map(str,bbox))
 path=CACHE/('osm-'+ '-'.join(map(str,bbox))+'.xml')
 if not path.exists():
  data=urllib.request.urlopen(url,timeout=90).read(); ET.fromstring(data);path.write_bytes(data)
 print(path.name,flush=True)
 return ET.parse(path).getroot()
boxes=[(x,y,x+.0625,y+.095) for x in [141.11,141.1725,141.235,141.2975] for y in [45.09,45.185]]
roots=list(concurrent.futures.ThreadPoolExecutor(max_workers=3).map(get,boxes))
nodes={n.attrib['id']:{'lat':float(n.attrib['lat']),'lon':float(n.attrib['lon'])} for root in roots for n in root.findall('node')}
ways={};rels={}
for root in roots:
 for w in root.findall('way'):
  refs=[n.attrib['ref'] for n in w.findall('nd')]
  if all(n in nodes for n in refs):ways[w.attrib['id']]={'type':'way','id':int(w.attrib['id']),'tags':{t.attrib['k']:t.attrib['v'] for t in w.findall('tag')},'geometry':[nodes[n] for n in refs]}
 for r in root.findall('relation'):
  tags={t.attrib['k']:t.attrib['v'] for t in r.findall('tag')}
  if tags.get('boundary')=='administrative' and tags.get('name')=='利尻富士町':rels[r.attrib['id']]=tags
print('relations',rels,flush=True)
for rid,tags in rels.items():
 url='https://api.openstreetmap.org/api/0.6/relation/'+rid+'/full'
 path=CACHE/('relation-'+rid+'.xml')
 if not path.exists():path.write_bytes(urllib.request.urlopen(url,timeout=90).read())
 root=ET.parse(path).getroot()
 ns={n.attrib['id']:{'lat':float(n.attrib['lat']),'lon':float(n.attrib['lon'])} for n in root.findall('node')}
 ws={w.attrib['id']:[ns[n.attrib['ref']] for n in w.findall('nd')] for w in root.findall('way')}
 rel=root.find("relation[@id='"+rid+"']")
 members=[{'type':m.attrib['type'],'ref':int(m.attrib['ref']),'role':m.attrib['role'],'geometry':ws.get(m.attrib['ref'],[])} for m in rel.findall('member')]
 rels[rid]={'type':'relation','id':int(rid),'tags':tags,'members':members}
(OUT/'osm.json').write_text(json.dumps({'elements':list(ways.values())+list(rels.values())},ensure_ascii=False))
print('DONE',len(ways),len(rels),flush=True)
(OUT/'sources.json').write_text(json.dumps({
    'gsi':'https://maps.gsi.go.jp/development/ichiran.html',
    'dem_template':'https://cyberjapandata.gsi.go.jp/xyz/dem/12/{x}/{y}.txt',
    'elevation_zoom':12,
    'osm_api':'https://api.openstreetmap.org/api/0.6/',
    'osm_boxes':boxes,
    'license':'GSI content terms; OSM © OpenStreetMap contributors, ODbL 1.0',
    'google_reference':'https://www.google.com/maps/@45.180,141.242,12z/data=!5m1!1e4',
}, ensure_ascii=False, indent=2))
