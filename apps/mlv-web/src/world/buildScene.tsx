import { useMemo } from 'react';
import * as THREE from 'three';
import { CAMPUSES, COMMONS_LAYOUT, HOUSE_EXTERIOR, campusById as campusByIdRaw } from './sceneGraph.mjs';

export type Portal = {
  id: string;
  label: string;
  to: string;
  position: [number, number, number];
  rotationY: number;
  radius: number;
};

export type Scene = {
  id: string;
  kind: string;
  title: string;
  blurb: string;
  sky: string;
  campusId?: string;
  spawn: [number, number, number];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  frame: { position: [number, number, number]; lookAt: [number, number, number] };
  portals: Portal[];
};

type Palette = { wall: string; roof: string; trim: string; accent: string; glass: string };

export type Campus = {
  id: string;
  displayName: string;
  silhouette: string;
  buildingName: string;
  museumName: string;
  labName: string;
  sky: string;
  ground: string;
  disclaimer: string;
  palette: Palette;
  exhibits: string[];
  lobbyDoor: [number, number, number];
  museumDoor: [number, number, number];
};

export function asSceneMap(value: unknown): Record<string, Scene> {
  return value as Record<string, Scene>;
}

function campusById(id: string | undefined): Campus | null {
  if (!id) return null;
  return (campusByIdRaw(id) as Campus | null) ?? null;
}

function makeSignTexture(title: string, subtitle: string | undefined, bg: string, fg: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = subtitle ? 512 : 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 16;
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const titleSize = title.length > 18 ? 64 : title.length > 12 ? 84 : 112;
  ctx.font = `700 ${titleSize}px Georgia, "Palatino Linotype", serif`;
  ctx.fillText(title, canvas.width / 2, subtitle ? 190 : canvas.height / 2);
  if (subtitle) {
    ctx.font = '500 40px Georgia, "Palatino Linotype", serif';
    const lines = wrapLine(subtitle, 34);
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, 320 + index * 52);
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function wrapLine(text: string, max: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function Sign({
  text,
  sub,
  position,
  rotation = [0, 0, 0],
  width,
  height,
  bg = '#1b2430',
  fg = '#fff8ee',
}: {
  text: string;
  sub?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  bg?: string;
  fg?: string;
}) {
  const map = useMemo(() => makeSignTexture(text, sub, bg, fg), [text, sub, bg, fg]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  );
}

function Door({
  portal,
  onEnter,
  color = '#6b3a2a',
  quiet = false,
}: {
  portal: Portal;
  onEnter: (id: string) => void;
  color?: string;
  quiet?: boolean;
}) {
  return (
    <group
      position={portal.position}
      rotation={[0, portal.rotationY, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onEnter(portal.to);
      }}
    >
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.15, 2.15, 0.16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.05, 0.09]}>
        <boxGeometry args={[0.18, 0.18, 0.04]} />
        <meshStandardMaterial color="#f2c14e" />
      </mesh>
      {!quiet && (
        <Sign
          text={portal.label}
          position={[0, 2.45, 0.12]}
          width={2.2}
          height={0.42}
          bg="#243044"
          fg="#fff8ee"
        />
      )}
    </group>
  );
}

function GableRoof({
  width,
  depth,
  rise,
  color,
  position,
}: {
  width: number;
  depth: number;
  rise: number;
  color: string;
  position: [number, number, number];
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-depth / 2, 0);
    shape.lineTo(0, rise);
    shape.lineTo(depth / 2, 0);
    shape.closePath();
    const roof = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false });
    roof.translate(0, 0, -width / 2);
    roof.rotateY(-Math.PI / 2);
    return roof;
  }, [width, depth, rise]);
  return (
    <mesh geometry={geometry} position={position}>
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Mass({
  door,
  size,
  color,
  roof,
  roofColor,
}: {
  door: [number, number, number];
  size: [number, number, number];
  color: string;
  roof: 'gable' | 'flat' | 'none';
  roofColor: string;
}) {
  const [w, h, d] = size;
  const center: [number, number, number] = [door[0], h / 2, door[2] - d / 2];
  return (
    <group>
      <mesh position={center}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      {roof === 'gable' && (
        <GableRoof width={w} depth={d} rise={Math.max(0.9, h * 0.38)} color={roofColor} position={[center[0], h, center[2]]} />
      )}
      {roof === 'flat' && (
        <mesh position={[center[0], h + 0.08, center[2]]}>
          <boxGeometry args={[w + 0.25, 0.16, d + 0.2]} />
          <meshStandardMaterial color={roofColor} />
        </mesh>
      )}
    </group>
  );
}

function TrimWindow({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[1.08, 1.22, 0.1]} />
        <meshStandardMaterial color="#fff6ea" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.82, 0.96, 0.05]} />
        <meshStandardMaterial color="#9fd4ea" emissive="#1d4e6f" emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.06, 0.96, 0.04]} />
        <meshStandardMaterial color="#fff6ea" />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.82, 0.05, 0.04]} />
        <meshStandardMaterial color="#fff6ea" />
      </mesh>
    </group>
  );
}

function Tree({ position, leaf = '#3f7d4e' }: { position: [number, number, number]; leaf?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
        <meshStandardMaterial color="#6b4630" />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <sphereGeometry args={[0.72, 8, 6]} />
        <meshStandardMaterial color={leaf} />
      </mesh>
    </group>
  );
}

function PlayerHouse() {
  const [ax, , az] = HOUSE_EXTERIOR.anchor as [number, number, number];
  const [w, h, d] = HOUSE_EXTERIOR.size as [number, number, number];
  return (
    <group position={[ax, 0, az]}>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[w + 0.3, 0.36, d + 0.25]} />
        <meshStandardMaterial color="#8d7562" />
      </mesh>
      <mesh position={[0, h / 2 + 0.2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#e7c4a1" />
      </mesh>
      <GableRoof width={w + 0.55} depth={d + 0.5} rise={1.55} color="#8d3b32" position={[0, h + 0.2, 0]} />
      <mesh position={[1.7, h + 1.15, -0.35]}>
        <boxGeometry args={[0.55, 0.9, 0.55]} />
        <meshStandardMaterial color="#6e5148" />
      </mesh>
      <TrimWindow position={[-1.45, 1.55, d / 2 + 0.08]} />
      <TrimWindow position={[1.45, 1.55, d / 2 + 0.08]} />
      <TrimWindow position={[w / 2 + 0.06, 1.55, 0.2]} rotation={[0, Math.PI / 2, 0]} />
      <mesh position={[0, 0.22, d / 2 + 0.72]}>
        <boxGeometry args={[2.5, 0.16, 1.35]} />
        <meshStandardMaterial color="#c4a484" />
      </mesh>
      <mesh position={[0, 0.12, d / 2 + 1.55]}>
        <boxGeometry args={[2.2, 0.14, 0.48]} />
        <meshStandardMaterial color="#b08968" />
      </mesh>
      <mesh position={[-1.05, 1.15, d / 2 + 1.15]}>
        <boxGeometry args={[0.16, 2.1, 0.16]} />
        <meshStandardMaterial color="#fff6ea" />
      </mesh>
      <mesh position={[1.05, 1.15, d / 2 + 1.15]}>
        <boxGeometry args={[0.16, 2.1, 0.16]} />
        <meshStandardMaterial color="#fff6ea" />
      </mesh>
      <mesh position={[0, 2.25, d / 2 + 0.85]}>
        <boxGeometry args={[2.8, 0.12, 1.7]} />
        <meshStandardMaterial color="#8d3b32" />
      </mesh>
      <group position={[2.15, 0, d / 2 + 1.15]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.12, 1.1, 0.12]} />
          <meshStandardMaterial color="#5c5148" />
        </mesh>
        <mesh position={[0, 1.15, 0.12]}>
          <boxGeometry args={[0.46, 0.32, 0.28]} />
          <meshStandardMaterial color="#3d5c8a" />
        </mesh>
      </group>
      <group position={[-2.35, 0, d / 2 + 0.7]}>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[1.15, 0.42, 0.7]} />
          <meshStandardMaterial color="#8d5a3c" />
        </mesh>
        <mesh position={[-0.2, 0.7, 0]}>
          <sphereGeometry args={[0.32, 8, 6]} />
          <meshStandardMaterial color="#3f7d4e" />
        </mesh>
        <mesh position={[0.28, 0.62, 0.05]}>
          <sphereGeometry args={[0.22, 8, 6]} />
          <meshStandardMaterial color="#d45d79" />
        </mesh>
      </group>
    </group>
  );
}

function Commons({ scene, onEnter }: { scene: Scene; onEnter: (id: string) => void }) {
  const houseDoor = scene.portals.find((portal) => portal.id === 'house-door');
  const transitDoor = scene.portals.find((portal) => portal.id === 'transit-door');
  const street = COMMONS_LAYOUT.street as { center: number[]; size: number[] };
  const path = COMMONS_LAYOUT.path as { center: number[]; size: number[] };
  const plaza = COMMONS_LAYOUT.plaza as { center: number[]; radius: number };
  return (
    <group>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[46, 0.16, 34]} />
        <meshStandardMaterial color="#6e8f62" />
      </mesh>
      <mesh position={street.center as [number, number, number]}>
        <boxGeometry args={street.size as [number, number, number]} />
        <meshStandardMaterial color="#5e656c" />
      </mesh>
      <mesh position={[0, 0.08, -1.7]}>
        <boxGeometry args={[42, 0.04, 0.7]} />
        <meshStandardMaterial color="#d9d1c3" />
      </mesh>
      <mesh position={path.center as [number, number, number]}>
        <boxGeometry args={path.size as [number, number, number]} />
        <meshStandardMaterial color="#d7c4a1" />
      </mesh>
      <mesh position={[8.4, 0.08, -2.4]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[12, 0.05, 1.3]} />
        <meshStandardMaterial color="#d7c4a1" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={plaza.center as [number, number, number]}>
        <circleGeometry args={[plaza.radius, 28]} />
        <meshStandardMaterial color="#e4d3b4" />
      </mesh>
      <mesh position={[plaza.center[0], 0.42, plaza.center[2]]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.12, 8, 18]} />
        <meshStandardMaterial color="#8ecae6" />
      </mesh>
      <Sign
        text="3k MLV Commons"
        sub="Neighborhood hub"
        position={[plaza.center[0], 2.15, plaza.center[2] + 2.3]}
        width={4.4}
        height={1.5}
        bg="#243044"
        fg="#fff8ee"
      />
      <PlayerHouse />
      {houseDoor && <Door portal={houseDoor} onEnter={onEnter} />}
      <Mass
        door={COMMONS_LAYOUT.transitDoor as [number, number, number]}
        size={[5.4, 3.15, 4.1]}
        color="#d8e2ea"
        roof="gable"
        roofColor="#3e4c59"
      />
      {transitDoor && <Door portal={transitDoor} onEnter={onEnter} color="#243044" />}
      <Sign
        text="Campus Transit"
        sub="Seven destinations"
        position={[15.4, 3.55, 1.9]}
        width={3.4}
        height={1.15}
        bg="#243044"
      />
      <Tree position={[-6.2, 0, 5.2]} />
      <Tree position={[-16.5, 0, -2]} />
      <Tree position={[6.5, 0, 4.6]} leaf="#2f6d4f" />
      <Tree position={[8.8, 0, -9.2]} />
      <Tree position={[-4.2, 0, -10.5]} leaf="#4e8a55" />
      <mesh position={[-2.2, 0.45, -6.4]}>
        <boxGeometry args={[1.4, 0.45, 0.5]} />
        <meshStandardMaterial color="#8d5a3c" />
      </mesh>
      <mesh position={[4.6, 0.45, -7.2]}>
        <boxGeometry args={[1.4, 0.45, 0.5]} />
        <meshStandardMaterial color="#8d5a3c" />
      </mesh>
      {[-8, 0, 8].map((x) => (
        <group key={x} position={[x, 0, -2.3]}>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 2.6, 6]} />
            <meshStandardMaterial color="#243044" />
          </mesh>
          <mesh position={[0, 2.55, 0]}>
            <sphereGeometry args={[0.18, 8, 6]} />
            <meshStandardMaterial color="#f2c14e" emissive="#f2c14e" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Transit({ scene, onEnter }: { scene: Scene; onEnter: (id: string) => void }) {
  const campuses = CAMPUSES as unknown as Campus[];
  return (
    <group>
      <mesh position={[0, -0.06, -1]}>
        <boxGeometry args={[32, 0.12, 26]} />
        <meshStandardMaterial color="#d5ddd4" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -2.2]}>
        <circleGeometry args={[11.5, 32]} />
        <meshStandardMaterial color="#c9d3cc" />
      </mesh>
      <Sign
        text="Campus Transit"
        sub="Seven stylized destinations"
        position={[-8.4, 1.7, 4.6]}
        width={4.2}
        height={1.35}
        bg="#243044"
      />
      {scene.portals.map((portal) => {
        if (portal.id === 'back-commons') {
          return <Door key={portal.id} portal={portal} onEnter={onEnter} color="#243044" />;
        }
        const campus = campuses.find((item) => portal.id === `gate-${item.id}`);
        if (!campus) return null;
        const [x, , z] = portal.position;
        return (
          <group key={portal.id}>
            <mesh position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.25, 20]} />
              <meshStandardMaterial color={campus.palette.accent} emissive={campus.palette.accent} emissiveIntensity={0.28} />
            </mesh>
            <mesh position={[x, 1.15, z - 1.45]}>
              <boxGeometry args={[1.7, 2.3, 1.35]} />
              <meshStandardMaterial color={campus.palette.wall} />
            </mesh>
            <mesh position={[x, 2.45, z - 1.45]}>
              <boxGeometry args={[1.95, 0.16, 1.6]} />
              <meshStandardMaterial color={campus.palette.roof} />
            </mesh>
            <mesh position={[x - 0.9, 1.35, z]}>
              <boxGeometry args={[0.16, 2.7, 0.16]} />
              <meshStandardMaterial color={campus.palette.trim} />
            </mesh>
            <mesh position={[x + 0.9, 1.35, z]}>
              <boxGeometry args={[0.16, 2.7, 0.16]} />
              <meshStandardMaterial color={campus.palette.trim} />
            </mesh>
            <mesh position={[x, 2.65, z]}>
              <boxGeometry args={[2.15, 0.14, 0.18]} />
              <meshStandardMaterial color={campus.palette.roof} />
            </mesh>
            <Sign
              text={campus.displayName}
              position={[x, 2.15, z + 0.2]}
              width={1.85}
              height={0.62}
              bg={campus.palette.wall}
              fg="#fffaf3"
            />
            <Door portal={portal} onEnter={onEnter} color={campus.palette.trim} quiet />
          </group>
        );
      })}
    </group>
  );
}

function ArrivalSign({ campus }: { campus: Campus }) {
  return (
    <Sign
      text={campus.displayName}
      sub={campus.disclaimer}
      position={[-7.1, 2.35, 4.4]}
      width={3.2}
      height={1.15}
      bg="#243044"
    />
  );
}

function CampusExtras({ campus }: { campus: Campus }) {
  const lobby = campus.lobbyDoor;
  const museum = campus.museumDoor;
  if (campus.silhouette === 'civic-hall') {
    return (
      <group>
        <mesh position={[lobby[0], 2.55, lobby[2] + 0.9]}>
          <boxGeometry args={[3.4, 0.1, 1.5]} />
          <meshStandardMaterial color={campus.palette.roof} />
        </mesh>
        <mesh position={[lobby[0] - 3.2, 1.2, lobby[2] + 0.4]}>
          <boxGeometry args={[0.12, 1.6, 1.1]} />
          <meshStandardMaterial color={campus.palette.accent} />
        </mesh>
        <mesh position={[lobby[0] + 3.3, 1.2, lobby[2] + 0.2]}>
          <boxGeometry args={[0.12, 1.4, 0.9]} />
          <meshStandardMaterial color="#f4efe4" />
        </mesh>
      </group>
    );
  }
  if (campus.silhouette === 'courtyard') {
    return (
      <group>
        <Tree position={[0, 0, -1.2]} leaf="#2f6b3a" />
        <mesh position={[-3.2, 0.7, -1.4]}>
          <boxGeometry args={[2.2, 1.4, 2.2]} />
          <meshStandardMaterial color={campus.palette.trim} />
        </mesh>
        <mesh position={[3.3, 0.65, -1.6]}>
          <boxGeometry args={[2.1, 1.3, 2]} />
          <meshStandardMaterial color={campus.palette.roof} />
        </mesh>
        <mesh position={[museum[0], 1.35, museum[2] - 1.7]}>
          <cylinderGeometry args={[1.8, 1.95, 2.7, 10]} />
          <meshStandardMaterial color={campus.palette.wall} />
        </mesh>
      </group>
    );
  }
  if (campus.silhouette === 'river-linear') {
    return (
      <group>
        <mesh position={[-6.4, 0.08, -1]}>
          <boxGeometry args={[1.4, 0.08, 14]} />
          <meshStandardMaterial color="#2f8f8a" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[-1.5 + i * 0.15, 0.1, 4.2 - i * 2.2]}>
            <boxGeometry args={[2.4, 0.06, 0.9]} />
            <meshStandardMaterial color="#e7d7bf" />
          </mesh>
        ))}
      </group>
    );
  }
  if (campus.silhouette === 'workshop-yard') {
    return (
      <group>
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} position={[lobby[0] + x, lobby[2] > 0 ? 3.5 : 3.5, lobby[2] - 2.2]} rotation={[0.65, 0, 0]}>
            <boxGeometry args={[3.2, 0.12, 1.4]} />
            <meshStandardMaterial color={campus.palette.roof} />
          </mesh>
        ))}
        <mesh position={[4.2, 0.4, 4.2]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#8a5a32" />
        </mesh>
        <mesh position={[5.1, 0.7, 4.4]}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#6e6256" />
        </mesh>
      </group>
    );
  }
  if (campus.silhouette === 'grid-halls') {
    return (
      <group>
        {[-4, -2, 0, 2].map((x) => (
          <mesh key={x} position={[x, 1.5, -0.4]}>
            <boxGeometry args={[0.16, 3, 0.16]} />
            <meshStandardMaterial color={campus.palette.trim} />
          </mesh>
        ))}
        <mesh position={[lobby[0] + 3.4, 1.3, lobby[2] - 3.2]}>
          <boxGeometry args={[3.2, 2.6, 3.4]} />
          <meshStandardMaterial color="#3f4752" />
        </mesh>
      </group>
    );
  }
  if (campus.silhouette === 'learning-circles') {
    return (
      <group>
        {[[-6.4, 5.6], [-7.6, 3.4], [-4.8, 7.4], [6.8, 6.2], [7.6, 3.8]].map(([x, z], i) => (
          <mesh key={x} position={[x, 0.55, z]}>
            <cylinderGeometry args={[0.85, 0.95, 1.1, 10]} />
            <meshStandardMaterial color={i % 2 ? campus.palette.roof : campus.palette.wall} />
          </mesh>
        ))}
        <mesh position={[1.6, 0.35, 4.4]}>
          <sphereGeometry args={[0.35, 8, 6]} />
          <meshStandardMaterial color={campus.palette.roof} />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[16, 0.08, 12]} />
        <meshStandardMaterial color="#f4f7f8" />
      </mesh>
      <mesh position={[lobby[0] + 3.2, 0.9, lobby[2] - 3.4]}>
        <boxGeometry args={[2.2, 1.8, 2.4]} />
        <meshStandardMaterial color={campus.palette.roof} />
      </mesh>
      <mesh position={[museum[0] - 2.2, 0.7, museum[2] - 2.4]}>
        <boxGeometry args={[1.6, 1.4, 1.8]} />
        <meshStandardMaterial color={campus.palette.accent} />
      </mesh>
    </group>
  );
}

function CampusExterior({ scene, onEnter }: { scene: Scene; onEnter: (id: string) => void }) {
  const campus = campusById(scene.campusId);
  if (!campus) return null;
  const museumIsDrum = campus.silhouette === 'courtyard';
  return (
    <group>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[30, 0.14, 26]} />
        <meshStandardMaterial color={campus.ground} />
      </mesh>
      <Mass door={campus.lobbyDoor} size={campus.silhouette === 'river-linear' ? [7.4, 2.7, 3.4] : [6.8, 3.05, 4.6]} color={campus.palette.wall} roof={campus.silhouette === 'grid-halls' ? 'flat' : 'gable'} roofColor={campus.palette.roof} />
      {!museumIsDrum && (
        <Mass door={campus.museumDoor} size={[4.4, 2.7, 3.6]} color={campus.palette.trim} roof="gable" roofColor={campus.palette.roof} />
      )}
      <CampusExtras campus={campus} />
      <ArrivalSign campus={campus} />
      {scene.portals.map((portal) => (
        <Door key={portal.id} portal={portal} onEnter={onEnter} color={campus.palette.trim} />
      ))}
    </group>
  );
}

function RoomShell({ wall, floor }: { wall: string; floor: string }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10.2, 9.2]} />
        <meshStandardMaterial color={floor} />
      </mesh>
      <mesh position={[0, 1.7, -4.55]}>
        <boxGeometry args={[10.2, 3.4, 0.18]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh position={[-5.05, 1.7, 0]}>
        <boxGeometry args={[0.18, 3.4, 9.2]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh position={[5.05, 1.7, 0]}>
        <boxGeometry args={[0.18, 3.4, 9.2]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh position={[0, 1.7, 4.55]}>
        <boxGeometry args={[10.2, 3.4, 0.18]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <pointLight position={[0, 2.6, 0]} intensity={0.8} color="#fff1dc" />
    </group>
  );
}

function HouseRooms({ scene, onEnter }: { scene: Scene; onEnter: (id: string) => void }) {
  const study = scene.id === 'house-study';
  return (
    <group>
      <RoomShell wall={study ? '#efe2cf' : '#f6eadc'} floor="#b08968" />
      {scene.portals.map((portal) => (
        <Door key={portal.id} portal={portal} onEnter={onEnter} />
      ))}
      {study ? (
        <group>
          <mesh position={[1.4, 0.75, -3.3]}>
            <boxGeometry args={[2.4, 0.12, 1.1]} />
            <meshStandardMaterial color="#6b4226" />
          </mesh>
          <mesh position={[1.4, 0.4, -2.7]}>
            <boxGeometry args={[0.45, 0.8, 0.45]} />
            <meshStandardMaterial color="#8d5a3c" />
          </mesh>
          <mesh position={[-3.3, 1.4, -1.2]}>
            <boxGeometry args={[0.35, 2.2, 2.4]} />
            <meshStandardMaterial color="#6b4226" />
          </mesh>
          <TrimWindow position={[0, 1.6, -4.4]} />
        </group>
      ) : (
        <group>
          <mesh position={[0, 0.02, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 2.2]} />
            <meshStandardMaterial color="#8d3b32" />
          </mesh>
          <mesh position={[0, 0.45, -2.6]}>
            <boxGeometry args={[2.6, 0.7, 0.9]} />
            <meshStandardMaterial color="#c4554a" />
          </mesh>
          <mesh position={[-3.4, 0.9, 0.4]}>
            <boxGeometry args={[0.5, 1.5, 0.5]} />
            <meshStandardMaterial color="#f2c14e" />
          </mesh>
          <TrimWindow position={[2.2, 1.6, -4.4]} />
        </group>
      )}
    </group>
  );
}

function CampusLobby({ scene, onEnter }: { scene: Scene; onEnter: (id: string) => void }) {
  const campus = campusById(scene.campusId);
  if (!campus) return null;
  return (
    <group>
      <RoomShell wall="#f4efe6" floor={campus.palette.accent} />
      <Sign text={campus.displayName} sub={campus.buildingName} position={[0, 2.35, -4.3]} width={3.6} height={1.15} bg={campus.palette.wall} />
      <mesh position={[0, 0.55, -1.2]}>
        <boxGeometry args={[2.4, 1.0, 0.8]} />
        <meshStandardMaterial color={campus.palette.trim} />
      </mesh>
      {scene.portals.map((portal) => (
        <Door key={portal.id} portal={portal} onEnter={onEnter} color={campus.palette.wall} />
      ))}
    </group>
  );
}

function CampusLab({ scene, onEnter }: { scene: Scene; onEnter: (id: string) => void }) {
  const campus = campusById(scene.campusId);
  if (!campus) return null;
  return (
    <group>
      <RoomShell wall="#e7eef2" floor="#c8c2b4" />
      <Sign text={campus.labName} sub={campus.displayName} position={[0, 2.4, -4.3]} width={3.8} height={1.1} bg={campus.palette.wall} />
      <mesh position={[-1.6, 0.75, -2.4]}>
        <boxGeometry args={[2.8, 0.12, 1.2]} />
        <meshStandardMaterial color="#6b5344" />
      </mesh>
      <mesh position={[1.8, 0.75, -2.2]}>
        <boxGeometry args={[2.4, 0.12, 1.1]} />
        <meshStandardMaterial color="#6b5344" />
      </mesh>
      <mesh position={[0, 1.7, -4.25]}>
        <boxGeometry args={[2.2, 1.1, 0.08]} />
        <meshStandardMaterial color="#1c2430" emissive={campus.palette.accent} emissiveIntensity={0.35} />
      </mesh>
      {scene.portals.map((portal) => (
        <Door key={portal.id} portal={portal} onEnter={onEnter} color={campus.palette.wall} />
      ))}
    </group>
  );
}

function CampusGallery({ scene, onEnter }: { scene: Scene; onEnter: (id: string) => void }) {
  const campus = campusById(scene.campusId);
  if (!campus) return null;
  return (
    <group>
      <RoomShell wall="#f7f1e8" floor="#2c3138" />
      <Sign text={campus.museumName} sub="Original stylized gallery" position={[0, 2.55, -4.28]} width={4.2} height={1.05} bg="#241c18" />
      {campus.exhibits.map((title, index) => (
        <group key={title} position={[-2.6 + index * 2.6, 1.55, -4.2]}>
          <mesh>
            <boxGeometry args={[1.7, 1.35, 0.08]} />
            <meshStandardMaterial color={campus.palette.trim} />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[1.4, 1.05, 0.04]} />
            <meshStandardMaterial color={index === 1 ? campus.palette.accent : campus.palette.wall} />
          </mesh>
          <Sign text={title} position={[0, -0.95, 0.08]} width={1.6} height={0.32} bg="#241c18" />
        </group>
      ))}
      <mesh position={[0, 0.45, 0.2]}>
        <cylinderGeometry args={[0.42, 0.5, 0.9, 8]} />
        <meshStandardMaterial color={campus.palette.roof} />
      </mesh>
      {scene.portals.map((portal) => (
        <Door key={portal.id} portal={portal} onEnter={onEnter} color="#241c18" />
      ))}
    </group>
  );
}

export default function SceneBody({ scene, onEnter }: { scene: Scene; onEnter: (id: string) => void }) {
  if (scene.kind === 'commons') return <Commons scene={scene} onEnter={onEnter} />;
  if (scene.kind === 'transit') return <Transit scene={scene} onEnter={onEnter} />;
  if (scene.kind === 'house-room') return <HouseRooms scene={scene} onEnter={onEnter} />;
  if (scene.kind === 'campus-exterior') return <CampusExterior scene={scene} onEnter={onEnter} />;
  if (scene.kind === 'campus-lobby') return <CampusLobby scene={scene} onEnter={onEnter} />;
  if (scene.kind === 'campus-lab') return <CampusLab scene={scene} onEnter={onEnter} />;
  if (scene.kind === 'campus-gallery') return <CampusGallery scene={scene} onEnter={onEnter} />;
  return null;
}
