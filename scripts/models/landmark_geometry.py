"""Eight deliberately exaggerated, texture-free landmark miniatures."""
import bpy, math
from mathutils import Vector


def create_landmarks(ctx):
    box, mesh, move = ctx['box'], ctx['mesh'], ctx['move']
    surface, xy = ctx['surface'], ctx['xy']
    materials, collections = ctx['M'], ctx['COLS']
    for name, color in [('LandmarkStone','B6BEAA'),('LandmarkGrass','A6CF83'),('LandmarkGlass','5AAFAF'),('LandmarkWater','43BBA8'),('LandmarkRunway','6B8590'),('LandmarkWood','C69771'),('LandmarkCoral','E69C7D')]:
        materials[name] = ctx['material'](name,color,.7)
    collection = collections['Landmarks']
    top=bpy.data.objects.new('Landmarks',None);collection.objects.link(top)
    roots={}
    for item in ctx['landmarks']:
        x,y=xy(item['lon'],item['lat']);x+=item['offset'][0];y+=item['offset'][1]
        root=bpy.data.objects.new(item['id'],None);collection.objects.link(root)
        root.parent=top;root.location=(x,y,surface(x,y));root['name_ja']=item['name'];root['source']=item['source']
        root['anchor_lon']=item['lon'];root['anchor_lat']=item['lat'];roots[item['id']]=root

    current=None
    def attach(obj):
        obj.parent=current
        return obj
    def block(name,pos,size,mat='Walls',angle=0,rounding=.05):
        return attach(box(name,pos,size,mat,'Landmarks',angle,rounding))
    def shape(name,vs,fs,mat):return attach(mesh(name,vs,fs,mat,'Landmarks'))
    def cylinder(name,pos,radius,depth,mat,vertices=12):
        bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=pos)
        obj=move(bpy.context.object,'Landmarks');obj.name=name;obj.data.materials.append(materials[mat]);return attach(obj)
    def bar(name,a,b,radius=.045,mat='Walls'):
        d=Vector(b)-Vector(a);obj=cylinder(name,(Vector(a)+Vector(b))/2,radius,d.length,mat,8)
        obj.rotation_euler=d.to_track_quat('Z','Y').to_euler();return obj
    def loop(name,points,radius=.045,mat='LandmarkWood',closed=True):
        for a,b in zip(points,points[1:]+(points[:1] if closed else [])):bar(name,a,b,radius,mat)
    def tree(x,y,z,size=.8):
        cylinder('Park_trunk',(x,y,z+size*.35),size*.07,size*.7,'Trunk',6)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=size*.5,location=(x,y,z+size))
        obj=move(bpy.context.object,'Landmarks');obj.name='Landmark_canopy';obj.scale.z=1.15;obj.data.materials.append(materials['LeavesSage']);attach(obj)
    def lettering(text,pos,size=.35):
        curve=bpy.data.curves.new('Sign','FONT');curve.body=text;curve.align_x='CENTER';curve.size=size;curve.extrude=.006;curve.resolution_u=2
        obj=bpy.data.objects.new('Sign_'+text,curve);collection.objects.link(obj);obj.location=pos;obj.data.materials.append(materials['Walls']);attach(obj)
        bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH');obj.select_set(False)
    def hill(rx,ry,h,mat='LandmarkGrass'):
        n=16;vs=[]
        for r,z in [(1,-.15),(.86,h*.3),(.55,h*.82),(.22,h)]:
            vs.extend([(math.cos(i*math.tau/n)*rx*r,math.sin(i*math.tau/n)*ry*r,z) for i in range(n)])
        fs=[]
        for j in range(3):
            for i in range(n):
                a=j*n+i;b=j*n+(i+1)%n;c=b+n;d=a+n
                fs.extend([(a,b,c),(a,c,d)])
        fs.append(tuple(range(3*n,4*n)));return shape('Sculpted_hill',vs,fs,mat)
    def deck(x,y,z,w,d):
        block('Deck',(x,y,z),(w,d,.18),'LandmarkWood')
        for u in [-w/2,w/2]:
            for v in [-d/2,d/2]:bar('Deck_post',(x+u,y+v,z),(x+u,y+v,z+.65))
        loop('Deck_rail',[(x-w/2,y-d/2,z+.65),(x-w/2,y+d/2,z+.65),(x+w/2,y+d/2,z+.65),(x+w/2,y-d/2,z+.65)],closed=False)

    current=roots['PeshiCape']
    # Low coastal DEM is exaggerated into the characteristic steep rocky cape.
    cape=hill(1.55,1.15,3.5,'LandmarkStone')
    for v in cape.data.vertices:
        t=max(0,v.co.z/3.5)
        angle=math.atan2(v.co.y,v.co.x)
        v.co.x+=.32*t
        v.co.y*=1+.1*math.sin(angle*3)
        if t>.1:v.co.z*=1+.06*math.cos(angle*2)
    cape.data.update()
    cap=cylinder('Grassy_summit',(-.15,0,3.35),.7,.12,'LandmarkGrass');cap.scale.y=.6
    cylinder('Lighthouse_ledge',(-.72,-.3,3.01),.42,.14,'LandmarkGrass')
    cylinder('White_lighthouse',(-.72,-.3,3.46),.22,.9,'Walls')
    cylinder('Lantern',(-.72,-.3,4.02),.28,.25,'LandmarkGlass')
    cylinder('Lantern_roof',(-.72,-.3,4.2),.34,.13,'Walls')
    loop('Cape_walking_path',[(.6,-.8,.15),(.9,-.7,.7),(.3,-.6,1.25),(.6,-.4,1.9),(-.15,-.25,2.7)],.06,'Road',False)

    current=roots['RishiriAirport']
    # Runway follows actual OSM endpoints, independent of the enlarged terminal.
    way=next(w for w in ctx['ways'] if w['id']==442898211)
    a,b=ctx['geom']([way['geometry'][0],way['geometry'][-1]])
    ax,ay=current.location.x,current.location.y
    dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy);angle=math.atan2(dy,dx)
    def runway_part(name,t,v,w,d,mat,z=.08):
        x=a[0]+dx*t-math.sin(angle)*v;y=a[1]+dy*t+math.cos(angle)*v
        # Drape each section so the enlarged runway never disappears in the DEM.
        block(name,(x-ax,y-ay,surface(x,y)-current.location.z+z),(w,d,.07),mat,angle,.015)
    for i in range(36):runway_part('Runway', (i+.5)/36,0,length/36+.025,.8,'LandmarkRunway')
    for i in range(13):runway_part('Centerline',(i+1)/14,0,.24,.06,'Walls',.13)
    for t in [.045,.955]:
        for v in [-.24,-.08,.08,.24]:runway_part('Threshold',t,v,.38,.055,'Walls',.13)
    block('Terminal_glazing',(0,0,.88),(3.7,1.35,1.65),'LandmarkGlass')
    # Slightly curved barrel roof matches the terminal's sweeping silhouette.
    n=12;vs=[]
    for x in [-2.05,2.05]:
        vs.extend([(x,-.95+1.9*i/n,1.75+.5*math.sin(math.pi*i/n)) for i in range(n+1)])
    shape('Curved_terminal_roof',vs,[(i,i+1,i+n+2,i+n+1) for i in range(n)],'Walls')
    for x in [-1.65,-1.1,-.55,0,.55,1.1,1.65]:block('Terminal_mullion',(x,-.69,.9),(.07,.07,1.6))
    block('Airport_plinth',(0,0,.1),(4.1,1.8,.2),'Pier')
    lettering('RIS',(0,-.2,2.27),.62)

    current=roots['OshidomariFerryTerminal']
    block('Ferry_main',(0,0,.95),(3.8,1.75,1.8))
    block('Ferry_glass_ribbon',(0,-.89,1.15),(3.5,.08,.55),'LandmarkGlass')
    block('Ferry_glass_side',(-1.92,0,1.15),(.08,1.5,.55),'LandmarkGlass')
    block('Ferry_upper_slab',(0,0,1.95),(4.15,2,.18))
    block('Ferry_canopy',(0,-1.05,.73),(4.0,.7,.12),'RoofTeal')
    for x in [-1.6,-.8,0,.8,1.6]:block('Facade_column',(x,-.95,.7),(.08,.08,1.35))
    block('Boarding_gallery',(-2.7,.15,.75),(1.8,.58,.72),'LandmarkGlass')
    block('Gallery_roof',(-2.7,.15,1.15),(1.9,.7,.12))
    lettering('FERRY',(0,-.1,2.06),.46)

    current=roots['RishirifujiTownHall']
    block('Civic_main',(0,0,1.15),(3.3,1.65,2.25),'Sand')
    block('Civic_roof',(0,0,2.35),(3.6,1.95,.2),'Walls')
    block('Central_atrium',(0,-.86,1.26),(.7,.12,2.25),'LandmarkGlass')
    for x in [-1.25,-.85,.85,1.25]:
        for z in [.62,1.3,1.96]:block('Civic_window',(x,-.85,z),(.26,.045,.36),'Glass',rounding=.015)
    cylinder('Rooftop_tower',(.85,.22,2.8),.3,.8,'Walls')
    bar('Communication_mast',(.85,.22,3.15),(.85,.22,4.25),.04)
    for z in [3.4,3.7,4.0]:bar('Mast_crossarm',(.62,.22,z),(1.08,.22,z),.025)
    block('Entrance_canopy',(0,-1.15,.6),(1.2,.9,.13),'RoofTeal')
    for x in [-1.5,1.5]:
        bar('Flagpole',(x,-1.3,0),(x,-1.3,2.0),.035)
        block('Civic_flag',(x+.2,-1.3,1.8),(.4,.025,.27),'Walls',rounding=0)

    current=roots['TownHallPark']
    turf=cylinder('Playground_lawn',(0,0,.05),1.9,.18,'LandmarkGrass',24);turf.scale.y=.83
    loop('Park_path',[(1.72*math.cos(i*math.tau/24),1.36*math.sin(i*math.tau/24),.17) for i in range(24)],.085,'Road')
    block('Slide_tower',(-.5,0,.67),(.62,.65,1.2),'RoofTeal')
    block('Playhouse_roof',(-.5,0,1.33),(.8,.85,.14),'LandmarkCoral')
    bar('Slide_chute',(-.45,-.4,1.12),(-.45,-1.08,.22),.15,'RoofButter')
    for z in [.25,.5,.75,1.0]:bar('Ladder_rung',(-.9,.5,z),(-.1,.5,z),.03,'Walls')
    # The park's distinctive globe climbing frame, without people.
    for axis in range(3):
        points=[]
        for i in range(16):
            a=i*math.tau/16;p=[.52*math.cos(a),.52*math.sin(a),0]
            if axis==1:p=[p[0],0,p[1]]
            if axis==2:p=[0,p[0],p[1]]
            points.append((.8+p[0],.15+p[1],.74+p[2]))
        loop('Globe_climbing_frame',points,.035,'LandmarkCoral')
    tree(-1.2,.75,.15,.7);tree(1.15,.8,.15,.65)

    current=roots['HimePond']
    # Enlarged pond with a level water surface and a continuous boardwalk.
    z=.12
    bank=cylinder('Pond_grass_bank',(0,0,z-.1),3.2,.24,'LandmarkGrass',32);bank.scale.y=.8
    water=cylinder('Hime_emerald_water',(0,0,z+.055),2.9,.07,'LandmarkWater',40);water.scale.y=.8
    points=[(3.04*math.cos(i*math.tau/40),2.43*math.sin(i*math.tau/40),z+.15) for i in range(40)]
    loop('Lakeside_boardwalk',points,.11,'LandmarkWood')
    block('Pond_viewing_platform',(0,-2.42,z+.2),(1.3,.6,.12),'LandmarkWood')
    for a in [.2,.65,1.1,1.6,2.1,2.65,3.2]:tree(3.35*math.cos(a),2.8*math.sin(a),z,.9)

    current=roots['NumauraViewpoint']
    hill(2.2,1.8,1.7)
    deck(0,0,1.84,2.6,1.55)
    for i in range(5):block('Viewpoint_steps',(0,-1.65+i*.18,.3+i*.29),(1.0,.3,.17),'LandmarkWood')
    for x in [-.55,.55]:bar('Sign_post',(x,.75,1.8),(x,.75,2.7),.055,'LandmarkWood')
    block('Viewpoint_sign',(0,.75,2.55),(1.6,.14,.48),'RoofTeal')
    for x in [-1.5,1.5]:tree(x,.7,.7,.75)

    current=roots['OtatomariPond']
    # Retain the mapped irregular shore, enlarging it only for miniature legibility.
    way=next(w for w in ctx['ways'] if w['id']==416887304)
    anchor=next(p for p in ctx['landmarks'] if p['id']=='OtatomariPond')
    ax,ay=xy(anchor['lon'],anchor['lat'])
    shore=[((x-ax)*1.8,(y-ay)*1.8) for x,y in ctx['geom'](way['geometry'])[:-1]]
    if sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(shore,shore[1:]+shore[:1]))<0:shore.reverse()
    n=len(shore)
    shape('Otatomari_water',[(x,y,.17) for x,y in shore],[tuple(range(n))],'LandmarkWater')
    # A narrow bank and warm sand path frame the water without covering its shape.
    vs=[(x*r,y*r,z) for r,z in [(1,.15),(1.18,.14),(1.23,-.08)] for x,y in shore]
    fs=[]
    for j in range(2):
        for i in range(n):fs.append((j*n+i,(j+1)*n+i,(j+1)*n+(i+1)%n,j*n+(i+1)%n))
    shape('Otatomari_wetland_bank',vs,fs,'LandmarkGrass')
    loop('Otatomari_lakeside_path',[(x*1.12,y*1.12,.22) for x,y in shore],.085,'Road')
    # Shore-facing benches and a small name board mark the public viewing side.
    block('Lakeside_viewing_pad',(-1.8,-.15,.2),(.6,1.0,.1),'Road')
    block('Pond_bench',(-2,-.18,.45),(.25,.65,.1),'LandmarkWood')
    for y in [-.4,.05]:bar('Bench_leg',(-2,y,.18),(-2,y,.42),.04,'LandmarkWood')
    for y in [.42,.74]:bar('Pond_sign_post',(-1.95,y,.1),(-1.95,y,.64),.03,'LandmarkWood')
    block('Pond_sign',(-1.95,.58,.62),(.10,.46,.24),'RoofTeal')
    # Stylized Aka-ezo spruce silhouettes, concentrated on the mountain side.
    for x,y,size in [(1.8,-1.0,.8),(2.0,-.3,.95),(2,.5,.82),(1.65,1.1,.9),(.95,1.65,.75)]:
        cylinder('Otatomari_spruce_trunk',(x,y,.4),.06,.65,'Trunk',6)
        for z,r in [(.67,.37),(1.0,.27)]:
            bpy.ops.mesh.primitive_cone_add(vertices=8,radius1=r*size,radius2=.055,depth=.6*size,location=(x,y,z*size+.13))
            obj=move(bpy.context.object,'Landmarks');obj.name='Otatomari_spruce_crown';obj.data.materials.append(materials['LeavesSage']);attach(obj)
            mod=obj.modifiers.new('Soft conifer edges','BEVEL');mod.width=.035;mod.segments=1;bpy.ops.object.modifier_apply(modifier=mod.name)
    for i in [3,7,12,17,22,26]:
        x,y=shore[i]
        for d in [-.06,0,.06]:
            blade=block('Wetland_grass',(x*1.18+d,y*1.18,.29),(.035,.07,.23),'LeavesMint',rounding=.012)
            blade.rotation_euler.y=d*3

    # Keep named selectable roots, merging only within one landmark/material.
    for root in roots.values():
        groups={}
        for obj in list(root.children):
            if obj.type=='MESH':groups.setdefault(tuple(m.name for m in obj.data.materials),[]).append(obj)
        for mats,objects in groups.items():
            bpy.ops.object.select_all(action='DESELECT')
            for obj in objects:obj.select_set(True)
            bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
            obj=bpy.context.object;obj.name=root.name+'_'+('_'.join(mats));obj.parent=root
    print('Landmarks created:',len(roots),flush=True)
