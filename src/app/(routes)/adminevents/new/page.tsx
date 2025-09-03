// app/(routes)/adminevents/new/page.tsx
import UpdateEvents from "../_components/UpdateEvents";

export default function NewEventPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <UpdateEvents event={undefined} />
    </div>
  );
}
