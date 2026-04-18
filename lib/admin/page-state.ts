export type AdminSearchParams = Promise<Record<string, string | string[] | undefined>> | undefined;

export type AdminFlashState = {
  message: string | null;
  type: string | null;
};

export async function resolveAdminFlashState(searchParams: AdminSearchParams): Promise<AdminFlashState> {
  const params = searchParams ? await searchParams : {};

  return {
    message: typeof params.message === "string" ? params.message : null,
    type: typeof params.type === "string" ? params.type : null,
  };
}
