"""Blender --background --factory-startup --python scripts/models/build-miniature.py

Reproducible, texture-free diorama. Geographic source coordinates stay in the
JSON; Blender Z-up becomes glTF Y-up. Buildings are deliberately exaggerated.
"""
import bpy, json, math, pathlib, random, sys
from mathutils import Vector
from mathutils.geometry import delaunay_2d_cdt
from mathutils.bvhtree import BVHTree

ROOT = pathlib.Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'reference/island-source'
OUTPUT = ROOT / 'public/models'
ART = ROOT / 'artifacts/island-miniature'
sys.dont_write_bytecode=True
sys.path.insert(0,str(ROOT/'scripts/models'))
from landmark_geometry import create_landmarks
random.seed(914)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for c in list(bpy.data.collections):
    if c.name != 'Collection': bpy.data.collections.remove(c)
COLS={}
for name in ['Terrain','Buildings','Roads','Vegetation','Water','Landmarks','Presentation']:
    c=bpy.data.collections.new(name); bpy.context.scene.collection.children.link(c); COLS[name]=c

def move(obj, category):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    COLS[category].objects.link(obj)
    return obj

def linear(v): return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4

def material(name, hexcolor, roughness=.75):
    m=bpy.data.materials.new(name); m.use_nodes=True
    rgb=[linear(int(hexcolor[i:i+2],16)/255) for i in (0,2,4)]
    m.diffuse_color=(*rgb,1)
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*rgb,1)
    p.inputs['Roughness'].default_value=roughness
    return m
M={k:material(k,c,r) for k,c,r in [
 ('Meadow','B6D79B',.85),('Sage','A8CA91',.85),('Mint','C3DFA9',.85),
 ('Mountain','9FB39C',.88),('Highland','B6B9A9',.9),('Summit','E8E6D8',.85),
 ('Sand','E6D8B5',.85),('Cliff','C4BFAA',.87),('Rock','CDD2C4',.85),
 ('Walls','FFF3DF',.68),('RoofCoral','DF9D88',.7),('RoofTeal','82B5AB',.7),
 ('RoofButter','E2C88F',.7),('RoofSlate','9FAEB7',.7),('Glass','658E91',.4),
 ('Road','E9E4CD',.85),('RoadEdge','A2B593',.85),('Pier','DDD7C6',.8),
 ('LeavesMint','BBD7A1',.8),('LeavesSage','9FC7A0',.8),('LeavesLime','CFDBA5',.8),
 ('Trunk','C3A286',.85),('Lagoon','80C6B5',.4),('Sea','72C9B8',.5),('Foam','D4EBDA',.75)]}

def mesh(name, verts, faces, mat, cat):
    data=bpy.data.meshes.new(name); data.from_pydata(verts,[],faces); data.update()
    obj=bpy.data.objects.new(name,data); COLS[cat].objects.link(obj)
    if mat: data.materials.append(M[mat])
    return obj

def bevel(obj, amount=.06, segments=2):
    mod=obj.modifiers.new('Soft toy edges','BEVEL');mod.width=amount;mod.segments=segments
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj

def box(name, pos, size, mat, cat='Buildings', angle=0, rounding=.05):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos)
    obj=move(bpy.context.object,cat);obj.name=name;obj.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    obj.rotation_euler.z=angle; obj.data.materials.append(M[mat])
    if rounding: bevel(obj,rounding)
    return obj

# North points +X and east points -Y, to keep both towns on the visible arc.
LAT0,LON0=45.18,141.225
SX=111.32*5; SY=111.32*math.cos(math.radians(LAT0))*5

def xy(lon,lat): return ((lat-LAT0)*SX,-(lon-LON0)*SY)
def lonlat(x,y): return (LON0-y/SY,LAT0+x/SX)
landmarks=json.loads((SOURCE/'landmarks.json').read_text())
landmark_reserves=[(*xy(item['lon'],item['lat']),*item['offset'],item['clearance']) for item in landmarks]
def reserved_for_landmark(x,y):
    return any(math.hypot(x-a-dx,y-b-dy)<r for a,b,dx,dy,r in landmark_reserves)
TILES={}
for path in SOURCE.glob('dem-*.txt'):
    _,z,x,y=path.stem.split('-')
    TILES[int(x),int(y)]=[[float(v) if v!='e' else 0 for v in row.split(',')] for row in path.read_text().splitlines()]

def dem(lon,lat):
    px=(lon+180)/360*4096*256
    py=(1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*4096*256
    def get(x,y):
        tile=TILES.get((x//256,y//256))
        return tile[y%256][x%256] if tile else 0
    a,b=int(px),int(py); u,v=px-a,py-b
    return (get(a,b)*(1-u)+get(a+1,b)*u)*(1-v)+(get(a,b+1)*(1-u)+get(a+1,b+1)*u)*v

def height(x,y):
    h=.7+dem(*lonlat(x,y))*.0125
    # Flatten only the exaggerated Hime Pond basin; blend back to the DEM.
    px,py=xy(141.24565748,45.22662358)
    radius=math.hypot((x-px)/3.25,(y-py)/2.65)
    if radius<1.4:
        pond=.7+dem(141.24565748,45.22662358)*.0125
        t=max(0,min(1,(radius-1)/.4));t=t*t*(3-2*t)
        h=pond*(1-t)+h*t
    # The enlarged Otatomari shoreline needs a level basin beside Numaura hill.
    px,py=xy(141.28506738620695,45.12043761379311);px+=1.6;py+=.4
    radius=math.hypot((x-px)/2.3,(y-py)/2.05)
    if radius<1.35:
        pond=.7+dem(*lonlat(px,py))*.0125
        t=max(0,min(1,(radius-1)/.35));t=t*t*(3-2*t)
        h=pond*(1-t)+h*t
    return h

def geom(points):return [xy(p['lon'],p['lat']) for p in points]
def inside(p,poly):
    x,y=p; result=False
    for a,b in zip(poly,poly[1:]+poly[:1]):
        if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:result=not result
    return result

def join_lines(lines):
    lines=[list(line) for line in lines if len(line)>1]; rings=[]
    while lines:
        chain=lines.pop(0)
        while chain[-1]!=chain[0]:
            found=False
            for i,line in enumerate(lines):
                if chain[-1]==line[0]:chain+=line[1:]
                elif chain[-1]==line[-1]:chain+=line[-2::-1]
                elif chain[0]==line[-1]:chain=line[:-1]+chain
                elif chain[0]==line[0]:chain=line[:0:-1]+chain
                else:continue
                lines.pop(i);found=True;break
            if not found:break
        rings.append(chain)
    return rings

data=json.loads((SOURCE/'osm.json').read_text())['elements']
ways=[e for e in data if e['type']=='way' and e.get('geometry')]
coasts=join_lines([geom(e['geometry']) for e in ways if e.get('tags',{}).get('natural')=='coastline'])
coast=max(coasts,key=len)
assert coast[0]==coast[-1], 'Island coastline must form a complete closed ring'
# Approx. 70 m coastline sampling preserves capes without tiny sliver triangles.
outline=[coast[0]]
for p in coast[1:-1]:
    if math.dist(p,outline[-1])>.35:outline.append(p)
relations=[e for e in data if e['type']=='relation' and e.get('tags',{}).get('boundary')=='administrative' and ('利尻富士' in json.dumps(e.get('tags',{}),ensure_ascii=False) or 'Rishirifuji' in json.dumps(e.get('tags',{})))]
assert relations, 'Verified municipality boundary is required'
boundary=relations[0]
rings=join_lines([geom(m['geometry']) for m in boundary['members'] if m.get('role')=='outer' and m.get('geometry')])
assert all(r[0]==r[-1] for r in rings), 'Town boundary must be closed'
towns=[r[:-1] for r in rings]
def in_town(p):return any(inside(p,r) for r in towns)

# Constrained triangulation retains the real coastline and irregular facets.
pts=list(outline)
for ix in range(-55,57):
    for iy in range(-55,57):
        p=(ix*.94+random.uniform(-.2,.2),iy*.94+random.uniform(-.2,.2))
        if inside(p,outline) and min(math.dist(p,q) for q in outline)>.45:pts.append(p)
edges=[(i,(i+1)%len(outline)) for i in range(len(outline))]
verts,_,faces,*_=delaunay_2d_cdt([Vector(p) for p in pts],edges,[list(range(len(outline)))],1,.00001)
terrain_verts=[(p.x,p.y,height(p.x,p.y)) for p in verts]
print('Terrain triangles',len(faces),flush=True)
terrain=mesh('Rishiri_DEM_Terrain',terrain_verts,faces,None,'Terrain')
for name in ['Meadow','Sage','Mint','Mountain','Highland','Summit']:terrain.data.materials.append(M[name])
for poly in terrain.data.polygons:
    altitude=sum(terrain_verts[i][2] for i in poly.vertices)/len(poly.vertices)
    poly.material_index=random.choices([0,1,2],[.65,.18,.17])[0] if altitude<5 else (3 if altitude<12 else (4 if altitude<17 else 5))
terrain['source']='GSI DEM10B z12, vertical exaggeration 2.5x'
terrain['copyright']='国土地理院の標高タイルを加工して作成'
bvh=BVHTree.FromPolygons(terrain_verts,faces)
def surface(x,y):
    hit=bvh.ray_cast(Vector((x,y,100)),Vector((0,0,-1)))
    return hit[0].z if hit[0] else height(x,y)

# A thin sandy rim and soft stone skirt follow the actual island outline.
rimverts=[]; skirtverts=[]
for x,y in outline:
    z=height(x,y)
    rimverts.extend([(x,y,z+.035),(x*1.008,y*1.008,.52)])
    skirtverts.extend([(x*1.008,y*1.008,.52),(x*1.009,y*1.009,-1.6)])
n=len(outline); quads=[(i*2,((i+1)%n)*2,((i+1)%n)*2+1,i*2+1) for i in range(n)]
mesh('Pale_coastal_rim',rimverts,quads,'Sand','Terrain')
bevel(mesh('Island_clay_edge',skirtverts,quads,'Cliff','Terrain'),.12,2)
mesh('Island_underside',[(x*1.009,y*1.009,-1.6) for x,y in outline],[list(reversed(range(n)))],'Cliff','Terrain')

# Keep roads on the town side and drape them onto the exported terrain itself.
road_segments=[]
def ribbon(name,points,width,mat='Road',cat='Roads',lift=.06,record=False):
    v=[];f=[]
    for a,b in zip(points,points[1:]):
        dist=math.dist(a,b)
        if dist<.015:continue
        steps=max(1,math.ceil(dist/.35))
        dx,dy=(b[0]-a[0])/dist,(b[1]-a[1])/dist
        for s in range(steps):
            p=(a[0]+(b[0]-a[0])*s/steps,a[1]+(b[1]-a[1])*s/steps)
            q=(a[0]+(b[0]-a[0])*(s+1)/steps,a[1]+(b[1]-a[1])*(s+1)/steps)
            corners=[(p[0]-dy*width/2,p[1]+dx*width/2),(q[0]-dy*width/2,q[1]+dx*width/2),(q[0]+dy*width/2,q[1]-dx*width/2),(p[0]+dy*width/2,p[1]-dx*width/2)]
            if not all(in_town(c) for c in corners):continue
            i=len(v);v.extend([(x,y,surface(x,y)+lift) for x,y in corners]);f.append((i,i+3,i+2,i+1))
            if record:road_segments.append((p,q,width))
    return mesh(name,v,f,mat,cat) if f else None

for way in ways:
    tags=way.get('tags',{});kind=tags.get('highway')
    if kind not in ['primary','secondary','tertiary','residential','unclassified','service','cycleway']:continue
    p=geom(way['geometry']); width=.34 if kind in ['primary','secondary'] else (.22 if kind in ['tertiary','residential','unclassified'] else .13)
    ribbon('Road_'+str(way['id']),p,width,record=True)

# OSM building centroids determine placement; sparse representatives avoid a
# literal crowded city at island scale. No invented settlements outside town.
occupied=[];selected_buildings=[]
def distance_segment(p,a,b):
    dx,dy=b[0]-a[0],b[1]-a[1];l=dx*dx+dy*dy
    t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)) if l else 0
    return math.dist(p,(a[0]+dx*t,a[1]+dy*t))

def house(name,x,y,w,d,h,angle,roof):
    z=surface(x,y)
    box(name+'_walls',(x,y,z+h/2),(w,d,h),'Walls',angle=angle,rounding=.07)
    # A chunky gabled cap with a bevel, warm white walls and inset blue windows.
    vs=[(-w*.57,-d*.57,0),(w*.57,-d*.57,0),(w*.57,d*.57,0),(-w*.57,d*.57,0),(0,-d*.57,h*.48),(0,d*.57,h*.48)]
    obj=mesh(name+'_roof',vs,[(0,1,4),(3,5,2),(0,4,5,3),(1,2,5,4),(0,3,2,1)],roof,'Buildings')
    obj.location=(x,y,z+h-.02);obj.rotation_euler.z=angle;bevel(obj,.045,2)
    for wx in [-w*.25,w*.25]:
        ly=-d*.505
        px=x+wx*math.cos(angle)-ly*math.sin(angle);py=y+wx*math.sin(angle)+ly*math.cos(angle)
        box(name+'_window',(px,py,z+h*.58),(w*.19,.035,h*.27),'Glass',angle=angle,rounding=.012)

buildings=[w for w in ways if 'building' in w.get('tags',{})]
buildings.sort(key=lambda w:(0 if w.get('tags',{}).get('name') else 1,w['id']))
for way in buildings:
    if len(selected_buildings)>=84:break
    poly=geom(way['geometry'])[:-1]
    if len(poly)<3:continue
    p=(sum(x for x,y in poly)/len(poly),sum(y for x,y in poly)/len(poly))
    if not in_town(p) or not inside(p,outline) or reserved_for_landmark(*p):continue
    source_p=p
    # Toy houses are wider than their mapped footprint: nudge inland away from
    # the nearest road, never outside the municipality or the coastline.
    if road_segments:
        a,b,width=min(road_segments,key=lambda r:distance_segment(p,r[0],r[1]))
        dist=distance_segment(p,a,b)
        if dist<width/2+.52:
            dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy)
            side=1 if (p[0]-a[0])*(-dy)+(p[1]-a[1])*dx>=0 else -1
            shift=width/2+.52-dist
            p=(p[0]-dy/length*shift*side,p[1]+dx/length*shift*side)
    if not inside(p,outline) or not in_town(p):continue
    if min((math.dist(p,q) for q in occupied),default=100)<1.13:continue
    edge=max(zip(poly,poly[1:]+poly[:1]),key=lambda e:math.dist(*e));angle=math.atan2(edge[1][1]-edge[0][1],edge[1][0]-edge[0][0])
    w=random.uniform(.65,.96);d=random.uniform(.65,1.0);h=random.uniform(.45,.72)
    if not all(in_town((p[0]+dx,p[1]+dy)) for dx in [-.6,.6] for dy in [-.6,.6]):continue
    if any(distance_segment(p,a,b)<width/2+.35 for a,b,width in road_segments):continue
    house('OSM_'+str(way['id']),*p,w,d,h,angle,random.choice(['RoofCoral','RoofTeal','RoofButter','RoofSlate']))
    occupied.append(p);selected_buildings.append({'osm_id':way['id'],'source_lon':lonlat(*source_p)[0],'source_lat':lonlat(*source_p)[1],'lon':lonlat(*p)[0],'lat':lonlat(*p)[1]})

# 山腹の利尻岳山小屋は表示対象外。選定後に除き、他の家の配置・乱数順を保つ。
for obj in list(COLS['Buildings'].objects):
    if obj.name.startswith('OSM_515743750_'):
        bpy.data.objects.remove(obj,do_unlink=True)
selected_buildings=[b for b in selected_buildings if b['osm_id']!=515743750]

print('Buildings',len(selected_buildings),'Road segments',len(road_segments),flush=True)

# Ports retain mapped breakwater and pier centerlines; no moving craft.
ports=0
for way in ways:
    if way.get('tags',{}).get('man_made') not in ['pier','breakwater']:continue
    points=geom(way['geometry'])
    for a,b in zip(points,points[1:]):
        if not in_town(a) or not in_town(b):continue
        dist=math.dist(a,b)
        if dist<.04:continue
        box('Harbour_'+str(way['id']),((a[0]+b[0])/2,(a[1]+b[1])/2,.63),(dist+.08,.31,.35),'Pier','Buildings',math.atan2(b[1]-a[1],b[0]-a[0]),.06)
        ports+=1

lakes=[]
for way in ways:
    if way.get('tags',{}).get('natural')!='water' or way['id'] in [442979645,416887304]:continue
    poly=geom(way['geometry'])
    if len(poly)<4 or not all(in_town(p) for p in poly):continue
    lake=mesh('Lake_'+str(way['id']),[(x,y,surface(x,y)+.09) for x,y in poly[:-1]],[list(range(len(poly)-1))],'Lagoon','Water')
    lakes.append(way['id'])

# Round, low-resolution toy crowns; scatter only in low/mid elevation forest.
trees=[]
for _ in range(3500):
    x,y=random.uniform(-43,44),random.uniform(-43,40)
    if not in_town((x,y)) or not inside((x,y),outline) or reserved_for_landmark(x,y):continue
    alt=surface(x,y)
    if not 1.3<alt<9.5:continue
    if min((math.dist((x,y),p) for p in occupied),default=100)<1.4:continue
    if min((math.dist((x,y),p) for p in trees),default=100)<1.25:continue
    if any(distance_segment((x,y),a,b)<w/2+.58 for a,b,w in road_segments):continue
    if any(inside((x,y),geom(w['geometry'])) for w in ways if w['id'] in lakes):continue
    scale=random.uniform(.7,1.25)
    bpy.ops.mesh.primitive_cone_add(vertices=7,radius1=.105*scale,radius2=.08*scale,depth=.8*scale,location=(x,y,alt+.4*scale))
    obj=move(bpy.context.object,'Vegetation');obj.name='Tree_trunk';obj.data.materials.append(M['Trunk'])
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=.64*scale,location=(x,y,alt+1.02*scale))
    obj=move(bpy.context.object,'Vegetation');obj.name='Round_canopy';obj.scale=(1,.92,1.12);obj.data.materials.append(M[random.choice(['LeavesMint','LeavesSage','LeavesLime'])])
    for p in obj.data.polygons:p.use_smooth=True
    trees.append((x,y))
    if len(trees)>=330:break

# Low coastal stones have softened silhouettes, only on the visible town side.
for i,(x,y) in enumerate(outline):
    if i%5 or not in_town((x,y)):continue
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=random.uniform(.22,.5),location=(x,y,height(x,y)+.07))
    obj=move(bpy.context.object,'Terrain');obj.name='Coastal_pebble';obj.scale.z=.55;obj.data.materials.append(M['Rock']);bevel(obj,.06,1)

create_landmarks(locals())

# Merge by shared material inside each semantic collection to bound draw calls.
for category in ['Terrain','Buildings','Roads','Vegetation','Water']:
    groups={}
    for obj in list(COLS[category].objects):
        if obj.type=='MESH':groups.setdefault(tuple(m.name for m in obj.data.materials),[]).append(obj)
    for key,objects in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects:obj.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
        obj=bpy.context.object;obj.name=category+'_'+('_'.join(key) or 'mesh')
    if category=='Buildings':
        for obj in COLS[category].objects:
            if obj.type!='MESH':continue
            bpy.context.view_layer.objects.active=obj
            mod=obj.modifiers.new('Reduce tiny bevel facets','DECIMATE');mod.ratio=.65
            bpy.ops.object.modifier_apply(modifier=mod.name)
    if category=='Vegetation':
        for obj in COLS[category].objects:
            if obj.type!='MESH':continue
            bpy.context.view_layer.objects.active=obj
            mod=obj.modifiers.new('Background forest budget','DECIMATE');mod.ratio=.64
            bpy.ops.object.modifier_apply(modifier=mod.name)
    parent=bpy.data.objects.new(category,None);COLS[category].objects.link(parent)
    for obj in list(COLS[category].objects):
        if obj!=parent:obj.parent=parent

bpy.ops.object.select_all(action='DESELECT')
for cat in ['Terrain','Buildings','Roads','Vegetation','Water','Landmarks']:
    for obj in COLS[cat].objects:obj.select_set(True)

# Khronos Draco preserves the monochrome palette without image textures.
kwargs=dict(export_format='GLB',use_selection=True,export_yup=True,export_extras=True,export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=6,export_draco_position_quantization=14)
bpy.ops.export_scene.gltf(filepath=str(OUTPUT/'rishiri-miniature.glb'),**kwargs)
base_triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for c in COLS.values() for o in c.objects if o.type=='MESH')

pins={}
for name,lon,lat in [('oshidomari',141.2245,45.2417),('oniwaki',141.3095,45.1394)]:
    x,y=xy(lon,lat);pins[name]={'x':round(x,3),'y':round(surface(x,y)+2.7,3),'z':round(-y,3)}

# Save the editable desktop source before applying the mobile decimation.
scene=bpy.context.scene
scene.world.color=(.65,.65,.65)
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.84,.78,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.6
bpy.ops.object.camera_add(location=(-65,-110,82))
cam=move(bpy.context.object,'Presentation');cam.name='Preview_camera';cam.rotation_euler=(Vector((0,0,3))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=117;scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(-20,-30,100))
light=move(bpy.context.object,'Presentation');light.name='Softbox';light.data.energy=100000;light.data.shape='DISK';light.data.size=70
box('Preview_sea',(0,0,-1.7),(300,300,.1),'Sea','Presentation',rounding=0)
scene.render.engine='CYCLES';scene.cycles.samples=32
scene.render.resolution_x=1500;scene.render.resolution_y=1200;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG'
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'rishiri-miniature.blend'))
scene.render.filepath=str(ART/'model-preview.png');bpy.ops.render.render(write_still=True)

bpy.ops.object.select_all(action='DESELECT')
for cat in ['Terrain','Buildings','Roads','Vegetation','Water','Landmarks']:
    for obj in COLS[cat].objects:
        obj.select_set(True)
        if obj.type=='MESH' and cat in ['Terrain','Vegetation']:
            bpy.context.view_layer.objects.active=obj
            mod=obj.modifiers.new('Mobile silhouette reduction','DECIMATE');mod.ratio=.5 if cat=='Vegetation' else .62
            bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.export_scene.gltf(filepath=str(OUTPUT/'rishiri-miniature-mobile.glb'),**kwargs)
mobile_triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for name,c in COLS.items() if name!='Presentation' for o in c.objects if o.type=='MESH')
manifest={'landmarks':landmarks,'boundary_relation':boundary['id'],'source_building_count':len(buildings),'representative_buildings':selected_buildings,'tree_count':len(trees),'harbour_segments':ports,'lake_osm_ids':lakes,'desktop_triangles':base_triangles,'mobile_triangles':mobile_triangles,'pins':pins,'coordinate_system':{'origin':[LON0,LAT0],'units_per_km':5,'vertical_exaggeration':2.5,'gltf_axes':'X north, Y up, Z east'},'attribution':'国土地理院の標高タイルを加工して作成 / © OpenStreetMap contributors'}
(SOURCE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('MINIATURE_RESULT',json.dumps({k:v for k,v in manifest.items() if k!='representative_buildings'},ensure_ascii=False))
