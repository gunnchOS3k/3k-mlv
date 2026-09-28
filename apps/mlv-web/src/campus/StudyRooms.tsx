import { useState } from 'react';
import { createStudyRoom, friendDoesNotGrantStudyAccess, studyRoomAclAllows } from '@3k-mlv/campus';

type Actor = { id: string };

export default function StudyRooms({ actor }: { actor: Actor }) {
  const [rooms, setRooms] = useState(() => [
    createStudyRoom({ ownerId: actor.id, name: 'Common quiet room', acl: [] }),
  ]);
  const [name, setName] = useState('New study room');
  const [aclId, setAclId] = useState('');

  return (
    <section className="mlv-campus" aria-label="Study rooms">
      <h1>Study Rooms</h1>
      <p className="mlv-kicker">
        Unlimited instanced rooms. ACL is explicit. Friend status does not grant access.
        Home PRIVATE files never appear here.
      </p>
      <form
        className="mlv-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setRooms((current) => [createStudyRoom({ ownerId: actor.id, name, acl: [] }), ...current]);
        }}
      >
        <label>
          Room name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button type="submit">Create instance</button>
      </form>
      <ul className="mlv-room-grid">
        {rooms.map((room) => (
          <li key={room.id}>
            <article>
              <h2>{room.name}</h2>
              <p>Owner {room.owner_id}</p>
              <p>ACL: {room.acl.length ? room.acl.join(', ') : 'owner only'}</p>
              <p>You may enter: {studyRoomAclAllows({ room, actor }) ? 'yes' : 'no'}</p>
              <p>Friend auto-access: {friendDoesNotGrantStudyAccess({ room, friendId: 'friend-not-in-acl' }) ? 'blocked' : 'leaked'}</p>
              <label>
                Grant ACL
                <input value={aclId} onChange={(event) => setAclId(event.target.value)} />
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!aclId.trim()) return;
                  setRooms((current) => current.map((item) => (
                    item.id === room.id ? { ...item, acl: [...item.acl, aclId.trim()] } : item
                  )));
                  setAclId('');
                }}
              >
                Add to ACL
              </button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
