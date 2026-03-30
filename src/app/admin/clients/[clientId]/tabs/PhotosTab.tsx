'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Trash2, Calendar, FileText, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface Photo {
  id: string;
  photo_url: string;
  photo_type: 'before' | 'after' | 'progress';
  taken_at: string;
  note?: string;
  storage_path?: string;
}

export default function PhotosTab({ clientId }: { clientId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'before' | 'after' | 'progress'>('before');
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!clientId) return;
    loadPhotos();
  }, [clientId]);

  const loadPhotos = async () => {
    try {
      const res = await fetch(`/api/admin/photos?clientId=${clientId}`);
      const data = await res.json();
      if (Array.isArray(data)) setPhotos(data);
    } catch {
      toast.error('Không thể tải ảnh');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn (tối đa 5MB)');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file || !clientId) return;
    setUploading(true);

    try {
      // Step 1: Upload image to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', clientId);

      const uploadRes = await fetch('/api/admin/photos/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      // Step 2: Save metadata to DB
      const metaRes = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          uploaded_by: clientId, // Will be overridden by actual user in a full auth flow
          photo_url: uploadData.url,
          photo_type: photoType,
          taken_at: takenAt,
          note: note || null,
        }),
      });

      if (!metaRes.ok) throw new Error('Failed to save photo metadata');

      toast.success('Đã tải ảnh lên thành công!');
      
      // Reset form
      setFile(null);
      setPreview(null);
      setNote('');
      setShowUpload(false);
      loadPhotos();
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm('Bạn có chắc muốn xoá ảnh này?')) return;
    try {
      await fetch(`/api/admin/photos?id=${photo.id}`, { method: 'DELETE' });
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      toast.success('Đã xoá ảnh');
    } catch {
      toast.error('Lỗi khi xoá ảnh');
    }
  };

  const beforePhotos = photos.filter(p => p.photo_type === 'before');
  const afterPhotos = photos.filter(p => p.photo_type === 'after');
  const progressPhotos = photos.filter(p => p.photo_type === 'progress');

  const typeLabel: Record<string, string> = { before: 'Trước', after: 'Sau', progress: 'Tiến trình' };
  const typeColor: Record<string, string> = { before: 'bg-orange-100 text-orange-700', after: 'bg-emerald-100 text-emerald-700', progress: 'bg-blue-100 text-blue-700' };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Camera size={20} className="text-blue-500" /> Ảnh Before / After
        </h3>
        <Button onClick={() => setShowUpload(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full">
          <Upload size={16} className="mr-1" /> Tải ảnh lên
        </Button>
      </div>

      {/* Upload Dialog */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md relative animate-in zoom-in-95 duration-300">
            <button onClick={() => { setShowUpload(false); setFile(null); setPreview(null); }} className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full z-10">
              <X size={18} className="text-gray-500" />
            </button>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-black text-gray-900">Tải ảnh lên</h3>

              {/* File Picker / Preview */}
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border">
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                  <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  <Camera className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm font-medium">Nhấn để chọn ảnh</p>
                  <p className="text-xs mt-1">Tối đa 5MB</p>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              {/* Photo Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-500 uppercase">Loại ảnh</Label>
                <div className="flex gap-2">
                  {(['before', 'after', 'progress'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setPhotoType(type)}
                      className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg border transition-all ${
                        photoType === type ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {typeLabel[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-500 uppercase">Ngày chụp</Label>
                <Input type="date" value={takenAt} onChange={e => setTakenAt(e.target.value)} />
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-500 uppercase">Ghi chú (tuỳ chọn)</Label>
                <Input placeholder="VD: Sau 1 tháng tập" value={note} onChange={e => setNote(e.target.value)} />
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 font-bold h-11"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Đang tải...
                  </span>
                ) : (
                  <><Upload size={16} className="mr-2" /> Tải lên</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="border-2 border-dashed border-gray-200 shadow-none rounded-2xl overflow-hidden bg-gray-50/50">
            <CardContent className="h-64 flex flex-col items-center justify-center text-gray-400 p-6">
              <Camera className="w-12 h-12 opacity-20 mb-3" />
              <p className="font-bold text-gray-500 mb-1">Ảnh Trước (Before)</p>
              <p className="text-xs text-center">Chưa có ảnh. Bấm &quot;Tải ảnh lên&quot; để thêm.</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-dashed border-gray-200 shadow-none rounded-2xl overflow-hidden bg-gray-50/50">
            <CardContent className="h-64 flex flex-col items-center justify-center text-gray-400 p-6">
              <Camera className="w-12 h-12 opacity-20 mb-3" />
              <p className="font-bold text-gray-500 mb-1">Ảnh Sau (After)</p>
              <p className="text-xs text-center">Chưa có ảnh. Bấm &quot;Tải ảnh lên&quot; để thêm.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Before/After Side by Side */}
          {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500" /> Before
                </h4>
                <div className="space-y-3">
                  {beforePhotos.map(photo => (
                    <PhotoCard key={photo.id} photo={photo} onDelete={handleDelete} onView={setLightboxPhoto} />
                  ))}
                  {beforePhotos.length === 0 && (
                    <div className="h-40 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-300 text-sm">
                      Chưa có ảnh Before
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> After
                </h4>
                <div className="space-y-3">
                  {afterPhotos.map(photo => (
                    <PhotoCard key={photo.id} photo={photo} onDelete={handleDelete} onView={setLightboxPhoto} />
                  ))}
                  {afterPhotos.length === 0 && (
                    <div className="h-40 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-300 text-sm">
                      Chưa có ảnh After
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Photos */}
          {progressPhotos.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Tiến trình
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {progressPhotos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} onDelete={handleDelete} onView={setLightboxPhoto} compact />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setLightboxPhoto(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10" onClick={() => setLightboxPhoto(null)}>
            <X size={24} />
          </button>
          <div className="max-w-3xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxPhoto.photo_url} alt="" className="w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="mt-4 text-center text-white/70">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${typeColor[lightboxPhoto.photo_type]}`}>
                {typeLabel[lightboxPhoto.photo_type]}
              </span>
              <span className="ml-3 text-sm">{lightboxPhoto.taken_at}</span>
              {lightboxPhoto.note && <p className="mt-2 text-sm italic">{lightboxPhoto.note}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoCard({ photo, onDelete, onView, compact }: {
  photo: Photo;
  onDelete: (p: Photo) => void;
  onView: (p: Photo) => void;
  compact?: boolean;
}) {
  return (
    <div className={`group relative rounded-xl overflow-hidden border shadow-sm bg-white ${compact ? '' : ''}`}>
      <img
        src={photo.photo_url}
        alt={photo.note || 'Progress photo'}
        className={`w-full object-cover cursor-pointer transition-transform group-hover:scale-105 ${compact ? 'h-32' : 'h-48'}`}
        onClick={() => onView(photo)}
      />
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-xs font-bold flex items-center gap-1">
              <Calendar size={12} /> {photo.taken_at}
            </p>
            {photo.note && !compact && (
              <p className="text-xs mt-0.5 text-white/80 truncate max-w-[180px]">{photo.note}</p>
            )}
          </div>
          <div className="flex gap-1">
            <button onClick={() => onView(photo)} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 backdrop-blur-sm">
              <ZoomIn size={14} className="text-white" />
            </button>
            <button onClick={() => onDelete(photo)} className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-600 backdrop-blur-sm">
              <Trash2 size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
