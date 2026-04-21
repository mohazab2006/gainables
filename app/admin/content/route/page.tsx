import { connection } from "next/server";

import { ArrayEditor } from "@/components/admin/array-editor";
import { ContentField, contentInputClassName } from "@/components/admin/content-field";
import { TypedContentForm } from "@/components/admin/typed-form";
import { saveRoute } from "@/lib/actions/admin-content";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { resolveAdminFlashState, type AdminSearchParams } from "@/lib/admin/page-state";
import { getSiteContent } from "@/lib/content";

type Props = { searchParams?: AdminSearchParams };

export default async function AdminRoutePage({ searchParams }: Props) {
  await connection();
  await requireAuthorizedAdmin();
  const content = await getSiteContent();
  const { message, type } = await resolveAdminFlashState(searchParams);
  const value = content.route;

  return (
    <TypedContentForm
      title="Route"
      description="Controls the live route used by the homepage timeline and the track page: total distance, checkpoints, map center, and the polyline points used for GPS projection."
      previewHref="/track"
      previewLabel="View tracker"
      action={saveRoute}
      flashMessage={message}
      flashType={type}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ContentField label="Total distance (km)" required>
          <input name="totalDistanceKm" defaultValue={value.totalDistanceKm} className={contentInputClassName} required />
        </ContentField>
        <ContentField label="Map center latitude" required>
          <input name="mapCenterLat" defaultValue={value.mapCenter.lat} className={contentInputClassName} required />
        </ContentField>
        <ContentField label="Map center longitude" required>
          <input name="mapCenterLng" defaultValue={value.mapCenter.lng} className={contentInputClassName} required />
        </ContentField>
        <ContentField label="Map zoom" required>
          <input name="mapCenterZoom" defaultValue={value.mapCenter.zoom} className={contentInputClassName} required />
        </ContentField>
      </div>

      <ArrayEditor
        name="checkpoints"
        label="Checkpoints"
        description="Ordered ride markers shown on the homepage and tracker."
        initialItems={value.checkpoints.map((checkpoint) => ({
          stage: checkpoint.stage,
          name: checkpoint.name,
          km: String(checkpoint.km),
          distanceLabel: checkpoint.distanceLabel,
          lat: String(checkpoint.lat),
          lng: String(checkpoint.lng),
          note: checkpoint.note ?? "",
        }))}
        emptyItem={{ stage: "", name: "", km: "0", distanceLabel: "", lat: "0", lng: "0", note: "" }}
        fields={[
          { key: "stage", label: "Stage", placeholder: "50%" },
          { key: "name", label: "Name", placeholder: "Hawkesbury" },
          { key: "km", label: "KM", placeholder: "100" },
          { key: "distanceLabel", label: "Distance label", placeholder: "100 km" },
          { key: "lat", label: "Latitude", placeholder: "45.6076" },
          { key: "lng", label: "Longitude", placeholder: "-74.6058" },
          { key: "note", label: "Note", kind: "textarea", placeholder: "Halfway regroup before crossing into Quebec." },
        ]}
        addLabel="Add checkpoint"
        minItems={2}
        summaryKeys={["stage", "name"]}
      />

      <ArrayEditor
        name="polyline"
        label="Route polyline"
        description="Ordered lat/lng points used to project the live GPS marker into KM and progress. Keep the points in ride order."
        initialItems={value.polyline.map((point) => ({
          lat: String(point.lat),
          lng: String(point.lng),
        }))}
        emptyItem={{ lat: "0", lng: "0" }}
        fields={[
          { key: "lat", label: "Latitude", placeholder: "45.4215" },
          { key: "lng", label: "Longitude", placeholder: "-75.6972" },
        ]}
        addLabel="Add route point"
        minItems={2}
        summaryKeys={["lat", "lng"]}
      />
    </TypedContentForm>
  );
}
