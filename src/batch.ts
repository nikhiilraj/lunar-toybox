import * as T from 'three/webgpu';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
/** Bake only non-animated opaque meshes into material batches. Dynamic rigs stay separate. */
export function batchStatic(root:T.Object3D,excluded:Set<T.Object3D>=new Set()){
 root.updateWorldMatrix(true,true);
 const inverse=root.matrixWorld.clone().invert();
 const groups=new Map<string,{material:T.Material;cast:boolean;receive:boolean;meshes:T.Mesh[];geometries:T.BufferGeometry[]}>();
 root.traverse(object=>{
  if(!(object instanceof T.Mesh)||object instanceof T.InstancedMesh||Array.isArray(object.material)||object.material.transparent)return;
  for(let parent:T.Object3D|null=object;parent&&parent!==root;parent=parent.parent)if(excluded.has(parent))return;
  const key=`${object.material.uuid}:${object.castShadow}:${object.receiveShadow}`;
  let batch=groups.get(key);if(!batch){batch={material:object.material,cast:object.castShadow,receive:object.receiveShadow,meshes:[],geometries:[]};groups.set(key,batch);}
  const geo=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();
  geo.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,object.matrixWorld));
  // Materials here use positions/normals/UVs only; avoid inconsistent attributes.
  for(const name of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(name))geo.deleteAttribute(name);
  batch.meshes.push(object);batch.geometries.push(geo);
 });
 for(const batch of groups.values()){
  if(batch.meshes.length<2){batch.geometries.forEach(g=>g.dispose());continue;}
  const geometry=mergeGeometries(batch.geometries,false);if(!geometry)continue;
  geometry.computeBoundingSphere();const mesh=new T.Mesh(geometry,batch.material);mesh.castShadow=batch.cast;mesh.receiveShadow=batch.receive;mesh.name='Static material batch';
  for(const source of batch.meshes){source.removeFromParent();source.geometry.dispose();}for(const g of batch.geometries)g.dispose();root.add(mesh);
 }
}
