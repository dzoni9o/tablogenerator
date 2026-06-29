import { supabase } from "./supabase";

export async function listProjects() {
  const { data, error } = await supabase
    .from("tablo_projekti")
    .select("id, naziv, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveProject({ id, boardName, projectInfo, rows }) {
  const user = (await supabase.auth.getUser()).data.user;
  const sadrzaj = { boardName, projectInfo, rows };

  if (id) {
    const { data, error } = await supabase
      .from("tablo_projekti")
      .update({ naziv: boardName, sadrzaj, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase
    .from("tablo_projekti")
    .insert({ user_id: user.id, naziv: boardName, sadrzaj })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function loadProject(id) {
  const { data, error } = await supabase
    .from("tablo_projekti")
    .select("sadrzaj")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data.sadrzaj;
}

export async function deleteProject(id) {
  const { error } = await supabase.from("tablo_projekti").delete().eq("id", id);
  if (error) throw error;
}
