'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import classes from './page.module.css';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaSave, FaEdit, FaLock, FaTimes, FaCheck, FaUserCircle, FaBoxOpen, FaTruck, FaClock, FaCog, FaBox, FaTimesCircle, FaChevronRight, FaCreditCard, FaBell, FaGlobe, FaPalette, FaLink, FaStar } from 'react-icons/fa';
import { useCurrency } from '@/contexts/CurrencyContext';

// Order types
interface OrderItem {
  id: number;
  product_sku: string | null;
  product_title: string | null;
  product_image: string | null;
  variant_sku: string | null;
  quantity: string | null;
  price: string | null;
  subtotal: string | null;
  status: string;
  // Custom Curtain Fields
  is_custom_curtain?: boolean;
  custom_fabric_used_meters?: string | null;
  custom_attributes?: {
    mounting_type?: string | null;
    pleat_type?: string | null;
    pleat_density?: string | null;
    width?: string | null;
    height?: string | null;
    wing_type?: string | null;
  } | null;
}

interface Order {
  id: number;
  status: string;
  payment_status: string;
  original_currency: string;
  original_price: string | null;
  paid_currency: string;
  paid_amount: string | null;
  items_count: number;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderDetail extends Order {
  payment_method: string;
  card_type: string | null;
  card_last_four: string | null;
  delivery_address_title: string | null;
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_country: string | null;
  delivery_phone: string | null;
  items: OrderItem[];
  total_value: string;
}

// Reviews Tab Content Component
interface UserReview {
  id: number;
  rating: number;
  comment: string;
  product_sku: string;
  product_title: string;
  product_image: string | null;
  is_approved: boolean;
  created_at: string;
}

function ReviewsTabContent({ userId, locale, onShowToast }: { userId: number; locale: string; onShowToast: (type: 'success' | 'error', text: string) => void }) {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_user_reviews/${userId}/`
        );
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [userId]);

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm(locale === 'tr' ? 'Bu değerlendirmeyi silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/delete_review/${userId}/${reviewId}/`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        onShowToast('success', locale === 'tr' ? 'Değerlendirme silindi' : 'Review deleted');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      onShowToast('error', locale === 'tr' ? 'Silinemedi' : 'Failed to delete');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#f59e0b' : '#d1d5db', fontSize: '1rem' }}>★</span>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>{locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}</div>;

  if (reviews.length === 0) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#9ca3af' }}>
        <p>{locale === 'tr' ? 'Henüz değerlendirme yapmadınız.' : locale === 'ru' ? 'У вас пока нет отзывов.' : locale === 'pl' ? 'Nie masz jeszcze opinii.' : 'You have not written any reviews yet.'}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {reviews.map((review) => (
        <div key={review.id} style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          {review.product_image && (
            <img
              src={review.product_image}
              alt={review.product_title}
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>{review.product_title}</h4>
                <div style={{ marginTop: '0.25rem' }}>{renderStars(review.rating)}</div>
              </div>
              <button
                onClick={() => handleDeleteReview(review.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                {locale === 'tr' ? 'Sil' : 'Delete'}
              </button>
            </div>
            {review.comment && (
              <p style={{ margin: '0.5rem 0', color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.5 }}>{review.comment}</p>
            )}
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(review.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}


export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { currency: globalCurrency, setCurrency, rates, refreshRates } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
  });

  const [addresses, setAddresses] = useState<Array<{
    id: string;
    title: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    address: string;
    district?: string;
    city: string;
    postal_code?: string;
    country: string;
    isDefault: boolean;
  }>>([]);

  const [newAddress, setNewAddress] = useState({
    title: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    district: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Turkey',
  });

  // Location data state
  const [countries, setCountries] = useState<Array<{ code: string; name: string; flag?: string }>>([]);

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      newsletter: true
    },
    language: 'tr',
    currency: globalCurrency || 'TRY',
    theme: 'light'
  });
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ name: string }>>([]);
  const [selectedCountry, setSelectedCountry] = useState('Turkey');
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // Active tab for sidebar navigation - check URL param first
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'orders' || tabParam === 'addresses' || tabParam === 'settings' || tabParam === 'profile' || tabParam === 'reviews'
    ? tabParam as 'profile' | 'addresses' | 'orders' | 'settings' | 'reviews'
    : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'wishlist' | 'settings' | 'reviews'>(initialTab);

  // Sync activeTab with URL parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile' || tab === 'addresses' || tab === 'orders' || tab === 'settings' || tab === 'reviews') {
      setActiveTab(tab);
    } else {
      setActiveTab('profile');
    }
  }, [searchParams]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Order states
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Çeviriler
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      myProfile: { en: 'My Profile', tr: 'Profilim', ru: 'Мой профиль', pl: 'Mój profil' },
      accountInfo: { en: 'Account Information', tr: 'Hesap Bilgileri', ru: 'Информация об аккаунте', pl: 'Informacje o koncie' },
      personalInfo: { en: 'Personal Information', tr: 'Kişisel Bilgiler', ru: 'Личная информация', pl: 'Dane osobowe' },
      contactInfo: { en: 'Contact Information', tr: 'İletişim Bilgileri', ru: 'Контактная информация', pl: 'Informacje kontaktowe' },
      name: { en: 'Full Name', tr: 'Ad Soyad', ru: 'Полное имя', pl: 'Imię i nazwisko' },
      email: { en: 'Email Address', tr: 'E-posta Adresi', ru: 'Адрес электронной почты', pl: 'Adres e-mail' },
      phone: { en: 'Phone Number', tr: 'Telefon Numarası', ru: 'Номер телефона', pl: 'Numer telefonu' },
      myAddresses: { en: 'My Addresses', tr: 'Adreslerim', ru: 'Мои адреса', pl: 'Moje adresy' },
      addressTitle: { en: 'Address Title', tr: 'Adres Başlığı', ru: 'Название адреса', pl: 'Nazwa adresu' },
      address: { en: 'Address', tr: 'Adres', ru: 'Адрес', pl: 'Adres' },
      addressLine: { en: 'Address Line', tr: 'Adres Satırı', ru: 'Адресная строка', pl: 'Linia adresu' },
      city: { en: 'City', tr: 'Şehir', ru: 'Город', pl: 'Miasto' },
      district: { en: 'District', tr: 'İlçe', ru: 'Район', pl: 'Dzielnica' },
      state: { en: 'State/Province', tr: 'İl/Bölge', ru: 'Штат/Провинция', pl: 'Stan/Województwo' },
      postalCode: { en: 'Postal Code', tr: 'Posta Kodu', ru: 'Почтовый индекс', pl: 'Kod pocztowy' },
      country: { en: 'Country', tr: 'Ülke', ru: 'Страна', pl: 'Kraj' },
      firstName: { en: 'First Name', tr: 'Ad', ru: 'Имя', pl: 'Imię' },
      lastName: { en: 'Last Name', tr: 'Soyad', ru: 'Фамилия', pl: 'Nazwisko' },
      fullName: { en: 'Full Name', tr: 'Ad Soyad', ru: 'Полное имя', pl: 'Imię i nazwisko' },
      selectCountry: { en: 'Select Country', tr: 'Ülke Seçin', ru: 'Выберите страну', pl: 'Wybierz kraj' },
      selectCity: { en: 'Select City', tr: 'Şehir Seçin', ru: 'Выберите город', pl: 'Wybierz miasto' },
      selectDistrict: { en: 'Select District', tr: 'İlçe Seçin', ru: 'Выберите район', pl: 'Wybierz dzielnicę' },
      addAddress: { en: 'Add New Address', tr: 'Yeni Adres Ekle', ru: 'Добавить адрес', pl: 'Dodaj adres' },
      defaultAddress: { en: 'Default', tr: 'Varsayılan', ru: 'По умолчанию', pl: 'Domyślny' },
      setDefault: { en: 'Set as Default', tr: 'Varsayılan Yap', ru: 'Сделать основным', pl: 'Ustaw jako domyślny' },
      deleteAddress: { en: 'Delete', tr: 'Sil', ru: 'Удалить', pl: 'Usuń' },
      noAddresses: { en: 'No addresses added yet', tr: 'Henüz adres eklenmemiş', ru: 'Адреса еще не добавлены', pl: 'Nie dodano jeszcze adresów' },
      birthdate: { en: 'Birth Date', tr: 'Doğum Tarihi', ru: 'Дата рождения', pl: 'Data urodzenia' },
      edit: { en: 'Edit Profile', tr: 'Profili Düzenle', ru: 'Редактировать профиль', pl: 'Edytuj profil' },
      save: { en: 'Save Changes', tr: 'Değişiklikleri Kaydet', ru: 'Сохранить изменения', pl: 'Zapisz zmiany' },
      cancel: { en: 'Cancel', tr: 'İptal', ru: 'Отмена', pl: 'Anuluj' },
      loading: { en: 'Loading...', tr: 'Yükleniyor...', ru: 'Загрузка...', pl: 'Ładowanie...' },
      saveSuccess: { en: 'Profile updated successfully!', tr: 'Profil başarıyla güncellendi!', ru: 'Профиль успешно обновлен!', pl: 'Profil został zaktualizowany!' },
      saveError: { en: 'Failed to update profile', tr: 'Profil güncellenemedi', ru: 'Не удалось обновить профиль', pl: 'Nie udało się zaktualizować profilu' },
      notLoggedIn: { en: 'Please log in to view your profile', tr: 'Profilinizi görüntülemek için giriş yapın', ru: 'Войдите, чтобы просмотреть свой профиль', pl: 'Zaloguj się, aby zobaczyć swój profil' },
      changePassword: { en: 'Change Password', tr: 'Şifre Değiştir', ru: 'Изменить пароль', pl: 'Zmień hasło' },
      currentPassword: { en: 'Current Password', tr: 'Mevcut Şifre', ru: 'Текущий пароль', pl: 'Aktualne hasło' },
      newPassword: { en: 'New Password', tr: 'Yeni Şifre', ru: 'Новый пароль', pl: 'Nowe hasło' },
      confirmPassword: { en: 'Confirm New Password', tr: 'Yeni Şifreyi Onayla', ru: 'Подтвердите новый пароль', pl: 'Potwierdź nowe hasło' },
      passwordMismatch: { en: 'Passwords do not match', tr: 'Şifreler eşleşmiyor', ru: 'Пароли не совпадают', pl: 'Hasła nie pasują' },
      passwordSuccess: { en: 'Password changed successfully!', tr: 'Şifre başarıyla değiştirildi!', ru: 'Пароль успешно изменен!', pl: 'Hasło zostało zmienione!' },
      passwordError: { en: 'Failed to change password', tr: 'Şifre değiştirilemedi', ru: 'Не удалось изменить пароль', pl: 'Nie udało się zmienić hasła' },
      security: { en: 'Security', tr: 'Güvenlik', ru: 'Безопасность', pl: 'Bezpieczeństwo' },
      orders: { en: 'Orders', tr: 'Siparişlerim', ru: 'Заказы', pl: 'Zamówienia' },
      wishlist: { en: 'Wishlist', tr: 'Favorilerim', ru: 'Избранное', pl: 'Ulubione' },
      settings: { en: 'Settings', tr: 'Ayarlar', ru: 'Настройки', pl: 'Ustawienia' },
      logout: { en: 'Logout', tr: 'Çıkış Yap', ru: 'Выйти', pl: 'Wyloguj' },
      noOrders: { en: 'No orders found.', tr: 'Henüz siparişiniz bulunmuyor.', ru: 'Заказы не найдены.', pl: 'Nie znaleziono zamówień.' },
      settingsPlaceholder: { en: 'Settings coming soon.', tr: 'Ayarlar yakında eklenecek.', ru: 'Настройки скоро появятся.', pl: 'Ustawienia wkrótce.' },
      nameRequired: { en: 'Full name is required', tr: 'Ad Soyad alanı zorunludur', ru: 'Полное имя обязательно', pl: 'Imię i nazwisko jest wymagane' },
      phoneRequired: { en: 'Phone number is required', tr: 'Telefon numarası zorunludur', ru: 'Номер телефона обязателен', pl: 'Numer telefonu jest wymagany' },
      // Order translations
      orderDate: { en: 'Order Date', tr: 'Sipariş Tarihi', ru: 'Дата заказа', pl: 'Data zamówienia' },
      total: { en: 'Total', tr: 'Toplam', ru: 'Итого', pl: 'Suma' },
      items: { en: 'items', tr: 'ürün', ru: 'товаров', pl: 'przedmiotów' },
      viewDetails: { en: 'View Details', tr: 'Detayları Gör', ru: 'Подробнее', pl: 'Zobacz szczegóły' },
      orderDetails: { en: 'Order Details', tr: 'Sipariş Detayları', ru: 'Детали заказа', pl: 'Szczegóły zamówienia' },
      deliveryAddress: { en: 'Delivery Address', tr: 'Teslimat Adresi', ru: 'Адрес доставки', pl: 'Adres dostawy' },
      paymentInfo: { en: 'Payment Info', tr: 'Ödeme Bilgileri', ru: 'Платежная информация', pl: 'Informacje o płatności' },
      trackingNumber: { en: 'Tracking Number', tr: 'Kargo Takip No', ru: 'Номер отслеживания', pl: 'Numer śledzenia' },
      shippedAt: { en: 'Shipped Date', tr: 'Kargoya Verilme', ru: 'Дата отправки', pl: 'Data wysyłki' },
      deliveredAt: { en: 'Delivered Date', tr: 'Teslim Tarihi', ru: 'Дата доставки', pl: 'Data dostawy' },
      close: { en: 'Close', tr: 'Kapat', ru: 'Закрыть', pl: 'Zamknij' },
      pending: { en: 'Pending', tr: 'Beklemede', ru: 'В ожидании', pl: 'Oczekujące' },
      scheduled: { en: 'Scheduled', tr: 'Planlandı', ru: 'Запланировано', pl: 'Zaplanowane' },
      in_production: { en: 'In Production', tr: 'Hazırlanıyor', ru: 'В производстве', pl: 'W produkcji' },
      quality_check: { en: 'Quality Check', tr: 'Kalite Kontrol', ru: 'Контроль качества', pl: 'Kontrola jakości' },
      in_repair: { en: 'In Repair', tr: 'Onarımda', ru: 'В ремонте', pl: 'W naprawie' },
      ready: { en: 'Ready', tr: 'Hazır', ru: 'Готово', pl: 'Gotowe' },
      shipped: { en: 'Shipped', tr: 'Kargoya Verildi', ru: 'Отправлено', pl: 'Wysłano' },
      completed: { en: 'Delivered', tr: 'Teslim Edildi', ru: 'Доставлено', pl: 'Dostarczono' },
      cancelled: { en: 'Cancelled', tr: 'İptal Edildi', ru: 'Отменено', pl: 'Anulowano' },
      products: { en: 'Products', tr: 'Ürünler', ru: 'Товары', pl: 'Produkty' },
      quantity: { en: 'Qty', tr: 'Adet', ru: 'Кол-во', pl: 'Ilość' },
      price: { en: 'Price', tr: 'Fiyat', ru: 'Цена', pl: 'Cena' },
      notAvailable: { en: 'N/A', tr: 'Bilinmiyor', ru: 'Н/Д', pl: 'Brak' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
  };

  // Order helper functions
  const getStatusIcon = (orderStatus: string) => {
    switch (orderStatus) {
      case 'pending': return <FaClock />;
      case 'scheduled':
      case 'in_production':
      case 'quality_check':
      case 'in_repair': return <FaCog />;
      case 'ready': return <FaBox />;
      case 'shipped': return <FaTruck />;
      case 'completed': return <FaCheck />;
      case 'cancelled': return <FaTimesCircle />;
      default: return <FaClock />;
    }
  };

  const getStatusClass = (orderStatus: string) => {
    switch (orderStatus) {
      case 'pending': return classes.statusPending;
      case 'scheduled':
      case 'in_production':
      case 'quality_check':
      case 'in_repair': return classes.statusProcessing;
      case 'ready': return classes.statusReady;
      case 'shipped': return classes.statusShipped;
      case 'completed': return classes.statusCompleted;
      case 'cancelled': return classes.statusCancelled;
      default: return classes.statusPending;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'pl' ? 'pl-PL' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatPrice = (price: string | null, currency: string) => {
    if (!price) return t('notAvailable');
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency', currency: currency || 'TRY',
    }).format(numPrice);
  };

  // Fetch orders when orders tab is active
  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user || activeTab !== 'orders') return;

      setOrdersLoading(true);
      try {
        const userId = (session.user as any).id;
        if (!userId) {
          setOrdersLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_user_orders/${userId}/`
        );

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [(session?.user as any)?.id, activeTab]);

  // Fetch order detail
  const fetchOrderDetail = async (orderId: number) => {
    if (!session?.user) return;

    setDetailLoading(true);
    try {
      const userId = (session.user as any).id;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_order_detail/${userId}/${orderId}/`
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/login`);
    }
  }, [status, router, locale]);

  // Load user data from Django API
  useEffect(() => {
    const loadUserData = async () => {
      if (!session?.user?.email) return;

      try {
        // Use email to get user ID first, or modify API to accept email
        const userId = (session.user as any).id || session.user.email;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_web_client_profile/${userId}/`
        );

        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || session.user.name || '',
            email: data.email || session.user.email || '',
            phone: data.phone || '',
            birthdate: data.birthdate || '',
          });

          if (data.settings) {
            setSettings(prev => ({
              ...prev,
              currency: data.settings.currency || prev.currency,
              language: data.settings.language || prev.language,
              theme: data.settings.theme || prev.theme,
              notifications: {
                ...prev.notifications,
                ...data.settings.notifications
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to session data
        setFormData({
          name: session.user.name || '',
          email: session.user.email || '',
          phone: '',
          birthdate: '',
        });
      }
    };

    loadUserData();
  }, [session]);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/api/location/countries');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCountries(data.countries);
          }
        }
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };
    loadCountries();
  }, []);

  // Load Turkey cities automatically if Turkey is selected
  useEffect(() => {
    if (selectedCountry === 'Turkey') {
      const loadTurkeyCities = async () => {
        try {
          const response = await fetch('/api/location/turkey-cities');
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setCities(data.cities);
            }
          }
        } catch (error) {
          console.error('Error loading Turkey cities:', error);
        }
      };
      loadTurkeyCities();
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [selectedCountry]);

  // Load addresses when addresses tab is active
  useEffect(() => {
    const loadAddresses = async () => {
      if (!session?.user || activeTab !== 'addresses') return;

      try {
        const userId = (session.user as any).id || session.user.email;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_client_addresses/${userId}/`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.addresses) {
            setAddresses(data.addresses);
          }
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      }
    };

    loadAddresses();
  }, [session, activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = async () => {
    try {
      // Validate required fields
      if (!newAddress.title.trim()) {
        alert(t('addressTitle') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }
      if (!newAddress.first_name.trim() || !newAddress.last_name.trim()) {
        alert(t('fullName') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }
      if (!newAddress.phone.trim()) {
        alert(t('phone') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }
      if (!newAddress.address.trim()) {
        alert(t('addressLine') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }
      if (!newAddress.city.trim()) {
        alert(t('city') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }
      if (!newAddress.country.trim()) {
        alert(t('country') + ' ' + (locale === 'tr' ? 'gerekli' : 'is required'));
        return;
      }

      setLoading(true);
      const userId = (session?.user as any)?.id || session?.user?.email;

      // Prepare address data for Django backend
      const addressData = {
        web_client_id: userId,
        title: newAddress.title.trim(),
        first_name: newAddress.first_name.trim(),
        last_name: newAddress.last_name.trim(),
        phone: newAddress.phone.trim(),
        address: newAddress.address.trim(),
        district: newAddress.district.trim() || '',
        city: newAddress.city.trim(),
        state: newAddress.state.trim() || '',
        postal_code: newAddress.postal_code.trim() || '',
        country: newAddress.country.trim(),
        isDefault: addresses.length === 0 // First address is default
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/add_client_address/${userId}/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(addressData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Address save error:', errorData);
        throw new Error(errorData.error || 'Failed to save address');
      }

      const result = await response.json();
      console.log('Address saved successfully:', result);

      // Add new address to state
      const newAddressFromServer = {
        id: result.address?.id || result.id || String(Date.now()),
        title: addressData.title,
        first_name: addressData.first_name,
        last_name: addressData.last_name,
        phone: addressData.phone,
        address: addressData.address,
        district: addressData.district,
        city: addressData.city,
        postal_code: addressData.postal_code,
        country: addressData.country,
        isDefault: addressData.isDefault
      };

      setAddresses(prev => [...prev, newAddressFromServer]);

      // Show success message
      showToast('success', locale === 'tr'
        ? 'Adres başarıyla kaydedildi!'
        : locale === 'ru' ? 'Адрес успешно сохранен!'
          : locale === 'pl' ? 'Adres został pomyślnie zapisany!'
            : 'Address saved successfully!');

      // Reset form
      setNewAddress({
        title: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        district: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Turkey',
      });
      setSelectedCountry('Turkey');
      setSelectedCityId(null);
      setIsAddingAddress(false);
    } catch (error: any) {
      console.error('Error adding address:', error);
      showToast('error', locale === 'tr'
        ? 'Adres kaydedilemedi: ' + (error.message || 'Bilinmeyen hata')
        : locale === 'ru' ? 'Не удалось сохранить адрес: ' + (error.message || 'Неизвестная ошибка')
          : locale === 'pl' ? 'Nie udało się zapisać adresu: ' + (error.message || 'Nieznany błąd')
            : 'Failed to save address: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const userId = (session?.user as any)?.id || session?.user?.email;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/set_default_address/${userId}/${id}/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        setAddresses(prev =>
          prev.map(addr => ({ ...addr, isDefault: addr.id === id }))
        );
        showToast('success', t('saveSuccess'));
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      showToast('error', t('saveError'));
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const userId = (session?.user as any)?.id || session?.user?.email;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/delete_client_address/${userId}/${id}/`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        showToast('success', t('saveSuccess'));
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast('error', t('saveError'));
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setMessage(null);

    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      showToast('error', t('nameRequired'));
      return;
    }

    if (!formData.phone || formData.phone.trim() === '') {
      showToast('error', t('phoneRequired'));
      return;
    }

    setLoading(true);

    try {
      const userId = (session?.user as any)?.id || session?.user?.email;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const payload = {
        name: formData.name,
        phone: formData.phone,
        birthdate: formData.birthdate,
      };

      console.log('[Profile Update] Sending payload:', payload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/update_web_client_profile/${userId}/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      console.log('[Profile Update] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[Profile Update] Success:', data);
        showToast('success', t('saveSuccess'));
        setIsEditing(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Profile Update] Error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('error', t('saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSave = async () => {
    setLoading(true);
    try {
      const userId = (session?.user as any)?.id || session?.user?.email;
      if (!userId) throw new Error('User not authenticated');

      console.log('[Settings Save] User ID:', userId);
      console.log('[Settings Save] Settings to save:', settings);
      console.log('[Settings Save] Request URL:', `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/update_web_client_profile/${userId}/`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/update_web_client_profile/${userId}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings }),
        }
      );

      console.log('[Settings Save] Response status:', response.status);
      console.log('[Settings Save] Response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log('[Settings Save] Response data:', responseData);
        showToast('success', t('saveSuccess'));
        // Update global currency context
        setCurrency(settings.currency);
        // Refresh rates immediately to ensure accuracy
        await refreshRates();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Settings Save] Error response:', errorData);
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('[Settings Save] Error:', error);
      showToast('error', t('saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordLoading(true);
    setPasswordMessage(null);

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('passwordMismatch') });
      setPasswordLoading(false);
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordMessage({ type: 'error', text: t('passwordError') });
      setPasswordLoading(false);
      return;
    }

    try {
      const userId = (session?.user as any)?.id || session?.user?.email;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/change_password/${userId}/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_password: passwordData.currentPassword,
            new_password: passwordData.newPassword,
          }),
        }
      );

      if (response.ok) {
        showToast('success', t('passwordSuccess'));
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Django API returns 'error', check for that first
        throw new Error(errorData.error || errorData.message || 'Password change failed');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      // Show the specific error message from backend if available
      showToast('error', error.message || t('passwordError'));
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className={classes.container}>
        <div className={classes.loadingContainer}>
          <div className={classes.spinner}></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={classes.container}>
        <div className={classes.notLoggedIn}>
          <FaUser className={classes.notLoggedInIcon} />
          <p>{t('notLoggedIn')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      {/* Background Effects */}
      <div className={classes.backgroundGradient}></div>

      <div className={classes.contentWrapper}>
        {/* Sidebar Navigation */}
        <div className={classes.sidebar}>
          <div className={classes.sidebarMenu}>
            <button
              className={`${classes.menuItem} ${activeTab === 'profile' ? classes.active : ''}`}
              onClick={() => router.push(`/${locale}/account/profile?tab=profile`)}
            >
              <FaUser className={classes.menuIcon} />
              <span>{t('myProfile')}</span>
            </button>
            <button
              className={`${classes.menuItem} ${activeTab === 'addresses' ? classes.active : ''}`}
              onClick={() => router.push(`/${locale}/account/profile?tab=addresses`)}
            >
              <FaMapMarkerAlt className={classes.menuIcon} />
              <span>{t('myAddresses')}</span>
            </button>
            <button
              className={`${classes.menuItem} ${activeTab === 'orders' ? classes.active : ''}`}
              onClick={() => router.push(`/${locale}/account/profile?tab=orders`)}
            >
              <FaEnvelope className={classes.menuIcon} />
              <span>{t('orders')}</span>
            </button>
            <button
              className={`${classes.menuItem} ${activeTab === 'settings' ? classes.active : ''}`}
              onClick={() => router.push(`/${locale}/account/profile?tab=settings`)}
            >
              <FaLock className={classes.menuIcon} />
              <span>{t('settings')}</span>
            </button>
            <button
              className={`${classes.menuItem} ${activeTab === 'reviews' ? classes.active : ''}`}
              onClick={() => router.push(`/${locale}/account/profile?tab=reviews`)}
            >
              <FaStar className={classes.menuIcon} />
              <span>{locale === 'tr' ? 'Değerlendirmelerim' : locale === 'ru' ? 'Мои отзывы' : locale === 'pl' ? 'Moje Opinie' : 'My Reviews'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={classes.mainContent}>
          {/* Profile Header Card */}
          <div className={classes.profileHeader}>
            <div className={classes.avatarSection}>
              <div className={classes.avatarWrapper}>
                <div className={classes.avatar}>
                  <FaUserCircle />
                </div>
                <div className={classes.avatarBadge}>
                  <FaCheck />
                </div>
              </div>
              <div className={classes.userInfo}>
                <h1>{formData.name || 'User'}</h1>
                <p>{formData.email}</p>
              </div>
            </div>
            {!isEditing && activeTab === 'profile' && (
              <button
                className={classes.editButton}
                onClick={() => setIsEditing(true)}
              >
                <FaEdit /> <span>{t('edit')}</span>
              </button>
            )}
          </div>

          {/* Message */}
          {message && (
            <div className={`${classes.message} ${classes[message.type]}`}>
              <div className={classes.messageIcon}>
                {message.type === 'success' ? <FaCheck /> : <FaTimes />}
              </div>
              <span>{message.text}</span>
            </div>
          )}

          {/* Main Content Grid */}
          {activeTab === 'profile' && (
            <div className={classes.gridContainer}>
              {/* Personal Info Card */}
              <div className={classes.card}>
                <div className={classes.cardTitle}>
                  <FaUser className={classes.titleIcon} />
                  <h3>{t('accountInfo')}</h3>
                </div>
                <div className={classes.cardContent}>
                  <div className={classes.formGroup}>
                    <label>
                      <FaUser />
                      {t('name')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={classes.input}
                        placeholder="John Doe"
                      />
                    ) : (
                      <div className={classes.displayValue}>{formData.name || '-'}</div>
                    )}
                  </div>

                  <div className={classes.formGroup}>
                    <label>
                      <FaEnvelope />
                      {t('email')}
                    </label>
                    <div className={`${classes.displayValue} ${classes.emailValue}`}>
                      {formData.email}
                      <span className={classes.badge}>Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className={classes.card}>
                <div className={classes.cardTitle}>
                  <FaPhone className={classes.titleIcon} />
                  <h3>{t('contactInfo')}</h3>
                </div>
                <div className={classes.cardContent}>
                  <div className={classes.formGroup}>
                    <label>
                      <FaPhone />
                      {t('phone')}
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={classes.input}
                        placeholder="+90 555 123 45 67"
                      />
                    ) : (
                      <div className={classes.displayValue}>{formData.phone || '-'}</div>
                    )}
                  </div>

                  <div className={classes.formGroup}>
                    <label>
                      <FaBirthdayCake />
                      {t('birthdate')}
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleInputChange}
                        className={classes.input}
                      />
                    ) : (
                      <div className={classes.displayValue}>{formData.birthdate || '-'}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Card - Full Width */}
          {activeTab === 'addresses' && (
            <div className={`${classes.card} ${classes.fullWidthCard}`}>
              <div className={classes.cardTitle}>
                <FaMapMarkerAlt className={classes.titleIcon} />
                <h3>{t('myAddresses')}</h3>
              </div>
              <div className={classes.cardContent}>
                {/* Address List */}
                {addresses.length > 0 ? (
                  <div className={classes.addressList}>
                    {addresses.map((addr) => (
                      <div key={addr.id} className={classes.addressCard}>
                        <div className={classes.addressHeader}>
                          <h4>{addr.title}</h4>
                          {addr.isDefault && (
                            <span className={classes.defaultBadge}>{t('defaultAddress')}</span>
                          )}
                        </div>
                        <p className={classes.addressText}>{addr.address}</p>
                        <p className={classes.addressText}>{addr.city}, {addr.country}</p>
                        <div className={classes.addressActions}>
                          {!addr.isDefault && (
                            <button
                              className={classes.setDefaultBtn}
                              onClick={() => handleSetDefaultAddress(addr.id)}
                            >
                              {t('setDefault')}
                            </button>
                          )}
                          <button
                            className={classes.deleteAddressBtn}
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            {t('deleteAddress')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={classes.noAddresses}>{t('noAddresses')}</p>
                )}

                {/* Add New Address Form */}
                {!isAddingAddress ? (
                  <button
                    className={classes.addAddressBtn}
                    onClick={() => setIsAddingAddress(true)}
                  >
                    + {t('addAddress')}
                  </button>
                ) : (
                  <div className={classes.newAddressForm}>
                    <div className={classes.formRow}>
                      <div className={classes.formGroup}>
                        <label>{t('addressTitle')}</label>
                        <input
                          type="text"
                          value={newAddress.title}
                          onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                          className={classes.input}
                          placeholder={locale === 'tr' ? 'Ev, İş, vb.' : 'Home, Work, etc.'}
                        />
                      </div>
                    </div>

                    <div className={classes.formRow}>
                      <div className={classes.formGroup}>
                        <label>{t('firstName')}</label>
                        <input
                          type="text"
                          value={newAddress.first_name}
                          onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })}
                          className={classes.input}
                        />
                      </div>
                      <div className={classes.formGroup}>
                        <label>{t('lastName')}</label>
                        <input
                          type="text"
                          value={newAddress.last_name}
                          onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })}
                          className={classes.input}
                        />
                      </div>
                    </div>

                    <div className={classes.formGroup}>
                      <label>{t('phone')}</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className={classes.input}
                        placeholder="+90 555 123 45 67"
                      />
                    </div>

                    <div className={classes.formGroup}>
                      <label>{t('addressLine')}</label>
                      <input
                        type="text"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        className={classes.input}
                        placeholder={locale === 'tr' ? 'Sokak, Mahalle, No' : 'Street, District, No'}
                      />
                    </div>

                    <div className={classes.formGroup}>
                      <label>{t('country')}</label>
                      <select
                        value={selectedCountry}
                        onChange={(e) => {
                          const country = e.target.value;
                          setSelectedCountry(country);
                          setNewAddress({ ...newAddress, country, city: '', district: '', state: '' });
                          setSelectedCityId(null);
                        }}
                        className={classes.input}
                      >
                        <option value="">{t('selectCountry')}</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedCountry === 'Turkey' ? (
                      <>
                        <div className={classes.formRow}>
                          <div className={classes.formGroup}>
                            <label>{t('city')}</label>
                            <select
                              value={selectedCityId || ''}
                              onChange={async (e) => {
                                const cityId = parseInt(e.target.value);
                                setSelectedCityId(cityId);
                                const city = cities.find(c => c.id === cityId);
                                if (city) {
                                  setNewAddress({ ...newAddress, city: city.name, district: '' });

                                  try {
                                    const response = await fetch(`/api/location/turkey-districts/${cityId}`);
                                    if (response.ok) {
                                      const data = await response.json();
                                      if (data.success) {
                                        setDistricts(data.districts);
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Error loading districts:', error);
                                  }
                                } else {
                                  setDistricts([]);
                                }
                              }}
                              className={classes.input}
                              disabled={!cities || cities.length === 0}
                            >
                              <option value="">{t('selectCity')}</option>
                              {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                  {city.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className={classes.formGroup}>
                            <label>{t('district')}</label>
                            <select
                              value={newAddress.district}
                              onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                              className={classes.input}
                              disabled={!selectedCityId}
                            >
                              <option value="">{t('selectDistrict')}</option>
                              {districts.map((district, index) => (
                                <option key={index} value={district.name}>
                                  {district.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className={classes.formGroup}>
                          <label>{t('postalCode')}</label>
                          <input
                            type="text"
                            value={newAddress.postal_code}
                            onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                            className={classes.input}
                            placeholder="34000"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={classes.formRow}>
                          <div className={classes.formGroup}>
                            <label>{t('city')}</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              className={classes.input}
                              placeholder={locale === 'tr' ? 'İstanbul' : 'City'}
                            />
                          </div>

                          <div className={classes.formGroup}>
                            <label>{t('state')}</label>
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              className={classes.input}
                              placeholder={locale === 'tr' ? 'İl/Bölge' : 'State/Province'}
                            />
                          </div>
                        </div>

                        <div className={classes.formGroup}>
                          <label>{t('postalCode')}</label>
                          <input
                            type="text"
                            value={newAddress.postal_code}
                            onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                            className={classes.input}
                            placeholder="12345"
                          />
                        </div>
                      </>
                    )}

                    <div className={classes.addressFormActions}>
                      <button
                        className={classes.saveBtn}
                        onClick={handleAddAddress}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className={classes.btnLoader}></div>
                        ) : (
                          <>
                            <FaCheck /> {t('save')}
                          </>
                        )}
                      </button>
                      <button
                        className={classes.cancelBtn}
                        onClick={() => {
                          setIsAddingAddress(false);
                          setNewAddress({
                            title: '',
                            first_name: '',
                            last_name: '',
                            phone: '',
                            address: '',
                            district: '',
                            city: '',
                            state: '',
                            postal_code: '',
                            country: 'Turkey',
                          });
                          setSelectedCountry('Turkey');
                          setSelectedCityId(null);
                        }}
                      >
                        <FaTimes /> {t('cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {activeTab === 'profile' && (
            <>
              {isEditing && (
                <div className={classes.actionButtons}>
                  <button
                    className={classes.cancelBtn}
                    onClick={() => {
                      setIsEditing(false);
                      setMessage(null);
                    }}
                    disabled={loading}
                  >
                    <FaTimes /> {t('cancel')}
                  </button>
                  <button
                    className={classes.saveBtn}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className={classes.btnLoader}></div>
                    ) : (
                      <>
                        <FaCheck /> {t('save')}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Security Card - Full Width */}
              <div className={`${classes.card} ${classes.fullWidthCard} ${classes.securityCard}`}>
                <div className={classes.cardTitle}>
                  <FaLock className={classes.titleIcon} />
                  <h3>{t('security')}</h3>
                </div>

                {passwordMessage && (
                  <div className={`${classes.message} ${classes[passwordMessage.type]}`}>
                    <div className={classes.messageIcon}>
                      {passwordMessage.type === 'success' ? <FaCheck /> : <FaTimes />}
                    </div>
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <div className={classes.cardContent}>
                  {!isChangingPassword ? (
                    <button
                      className={classes.changePasswordBtn}
                      onClick={() => setIsChangingPassword(true)}
                    >
                      <FaLock /> {t('changePassword')}
                    </button>
                  ) : (
                    <>
                      <div className={classes.passwordGrid}>
                        <div className={classes.formGroup}>
                          <label>
                            <FaLock />
                            {t('currentPassword')}
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className={classes.input}
                            placeholder="••••••••"
                          />
                        </div>

                        <div className={classes.formGroup}>
                          <label>
                            <FaLock />
                            {t('newPassword')}
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={classes.input}
                            placeholder="••••••••"
                          />
                        </div>

                        <div className={classes.formGroup}>
                          <label>
                            <FaLock />
                            {t('confirmPassword')}
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={classes.input}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className={classes.actionButtons}>
                        <button
                          className={classes.cancelBtn}
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordMessage(null);
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          disabled={passwordLoading}
                        >
                          <FaTimes /> {t('cancel')}
                        </button>
                        <button
                          className={classes.saveBtn}
                          onClick={handlePasswordSave}
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? (
                            <div className={classes.btnLoader}></div>
                          ) : (
                            <>
                              <FaCheck /> {t('save')}
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Orders Section */}
          {activeTab === 'orders' && (
            <div className={`${classes.card} ${classes.fullWidthCard}`}>
              <div className={classes.cardTitle}>
                <FaBox className={classes.titleIcon} />
                <h3>{t('orders')}</h3>
              </div>
              <div className={classes.cardContent}>
                {ordersLoading ? (
                  <div className={classes.ordersLoading}>
                    <div className={classes.spinner}></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className={classes.emptyOrders}>
                    <FaBoxOpen className={classes.emptyIcon} />
                    <p>{t('noOrders')}</p>
                  </div>
                ) : (
                  <div className={classes.ordersList}>
                    {orders.map((order) => (
                      <div key={order.id} className={classes.orderCard}>
                        <div className={classes.orderHeader}>
                          <div className={classes.orderInfo}>
                            <span className={classes.orderNumber}>#{order.id}</span>
                            <span className={classes.orderDate}>{formatDate(order.created_at)}</span>
                          </div>
                          <div className={`${classes.statusBadge} ${getStatusClass(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span>{t(order.status)}</span>
                          </div>
                        </div>
                        <div className={classes.orderBody}>
                          <div className={classes.orderSummary}>
                            <span className={classes.itemCount}>
                              {order.items_count ? `${order.items_count} ${t('items')}` : '-'}
                            </span>
                            <span className={classes.orderTotal}>
                              {order.original_price
                                ? formatPrice(order.original_price, order.original_currency)
                                : order.paid_amount
                                  ? formatPrice(order.paid_amount, order.paid_currency)
                                  : '-'
                              }
                            </span>
                          </div>
                          {order.tracking_number && (
                            <div className={classes.trackingInfo}>
                              <FaTruck />
                              <span>{t('trackingNumber')}: {order.tracking_number}</span>
                            </div>
                          )}
                        </div>
                        <button
                          className={classes.detailsBtn}
                          onClick={() => fetchOrderDetail(order.id)}
                        >
                          {t('viewDetails')}
                          <FaChevronRight />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className={classes.gridContainer}>
              {/* Notifications */}
              <div className={classes.card}>
                <div className={classes.cardTitle}>
                  <FaBell className={classes.titleIcon} />
                  <h3>{t('notifications') || 'Notifications'}</h3>
                </div>
                <div className={classes.cardContent}>
                  <div className={classes.settingItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontWeight: 500 }}>{t('emailNotifications') || 'Email Notifications'}</span>
                    <label className={classes.toggleSwitch}>
                      <input
                        type="checkbox"
                        className={classes.toggleInput}
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: e.target.checked }
                        }))}
                      />
                      <span className={classes.toggleSlider}></span>
                    </label>
                  </div>
                  <div className={classes.settingItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontWeight: 500 }}>{t('smsNotifications') || 'SMS Notifications'}</span>
                    <label className={classes.toggleSwitch}>
                      <input
                        type="checkbox"
                        className={classes.toggleInput}
                        checked={settings.notifications.sms}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, sms: e.target.checked }
                        }))}
                      />
                      <span className={classes.toggleSlider}></span>
                    </label>
                  </div>
                  <div className={classes.settingItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                    <span style={{ fontWeight: 500 }}>{t('newsletter') || 'Newsletter'}</span>
                    <label className={classes.toggleSwitch}>
                      <input
                        type="checkbox"
                        className={classes.toggleInput}
                        checked={settings.notifications.newsletter}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, newsletter: e.target.checked }
                        }))}
                      />
                      <span className={classes.toggleSlider}></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Language & Currency */}
              <div className={classes.card}>
                <div className={classes.cardTitle}>
                  <FaGlobe className={classes.titleIcon} />
                  <h3>{t('preferences') || 'Preferences'}</h3>
                </div>
                <div className={classes.cardContent}>
                  <div className={classes.formGroup}>
                    <label>{t('language') || 'Language'}</label>
                    <select
                      className={classes.input}
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                      <option value="ru">Русский</option>
                      <option value="pl">Polski</option>
                    </select>
                  </div>
                  <div className={classes.formGroup}>
                    <label>{t('currency') || 'Currency'}</label>
                    <select
                      className={classes.input}
                      value={settings.currency}
                      onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                    >
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="RUB">RUB (₽)</option>
                      <option value="PLN">PLN (zł)</option>
                    </select>
                    {settings.currency !== 'USD' && (
                      <div className={classes.rateInfo} style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaClock style={{ color: '#c9a961' }} />
                        <span>
                          1 USD = {
                            (() => {
                              const rateObj = rates.find(r => r.currency_code === settings.currency);
                              return rateObj ? `${rateObj.rate} ${settings.currency}` : '...';
                            })()
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button - Full Width at Bottom */}
              <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem' }}>
                <button
                  className={classes.settingsSaveBtn}
                  onClick={handleSettingsSave}
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {loading ? (
                    <div className={classes.btnLoader}></div>
                  ) : (
                    <>
                      <FaSave /> {t('save')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className={classes.modalOverlay} onClick={() => setSelectedOrder(null)}>
              <div className={classes.modal} onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <div className={classes.modalHeader} style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                  <h2>{t('orderDetails')} #{selectedOrder.id}</h2>
                  <button className={classes.closeBtn} onClick={() => setSelectedOrder(null)}>
                    <FaTimes />
                  </button>
                </div>

                {detailLoading ? (
                  <div className={classes.modalLoading}>
                    <div className={classes.spinner}></div>
                  </div>
                ) : (
                  <div className={classes.modalContent} style={{ padding: '1.5rem' }}>
                    {/* Status */}
                    <div className={classes.detailSection}>
                      <div className={`${classes.statusBadgeLarge} ${getStatusClass(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span>{t(selectedOrder.status)}</span>
                      </div>
                      <p className={classes.orderDateDetail}>
                        {t('orderDate')}: {formatDate(selectedOrder.created_at)}
                      </p>
                    </div>

                    {/* Tracking */}
                    {(selectedOrder.tracking_number || selectedOrder.shipped_at || selectedOrder.delivered_at) && (
                      <div className={classes.detailSection}>
                        <h3><FaTruck /> {t('trackingNumber')}</h3>
                        <div className={classes.trackingDetails}>
                          {selectedOrder.tracking_number && (
                            <p><strong>{t('trackingNumber')}:</strong> {selectedOrder.tracking_number}</p>
                          )}
                          {selectedOrder.shipped_at && (
                            <p><strong>{t('shippedAt')}:</strong> {formatDate(selectedOrder.shipped_at)}</p>
                          )}
                          {selectedOrder.delivered_at && (
                            <p><strong>{t('deliveredAt')}:</strong> {formatDate(selectedOrder.delivered_at)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Products */}
                    <div className={classes.detailSection}>
                      <h3><FaBox /> {t('products')}</h3>
                      <div className={classes.productsList}>
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className={classes.productItem}>
                            <div className={classes.productImage}>
                              {item.product_image ? (
                                <img src={item.product_image} alt={item.product_title || ''} />
                              ) : (
                                <FaBox className={classes.placeholderIcon} />
                              )}
                            </div>
                            <div className={classes.productInfo}>
                              <span className={classes.productTitle}>
                                {item.product_title || item.product_sku || t('notAvailable')}
                              </span>
                              {item.variant_sku && (
                                <span className={classes.variantSku}>SKU: {item.variant_sku}</span>
                              )}
                              {/* Custom Curtain Badge & Details */}
                              {item.is_custom_curtain && (
                                <div style={{ marginTop: '0.5rem' }}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '0.2rem 0.6rem',
                                    background: '#7c3aed',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    borderRadius: '9999px',
                                    marginBottom: '0.4rem'
                                  }}>
                                    ✂️ ÖZEL PERDE
                                  </span>
                                  {item.custom_attributes && (
                                    <div style={{
                                      background: '#f5f3ff',
                                      padding: '0.4rem',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      color: '#5b21b6',
                                      lineHeight: '1.4'
                                    }}>
                                      {item.custom_attributes.width && item.custom_attributes.height && (
                                        <div>📏 {item.custom_attributes.width}cm x {item.custom_attributes.height}cm</div>
                                      )}
                                      {item.custom_attributes.pleat_type && (
                                        <div>🧵 Pile: {item.custom_attributes.pleat_type}</div>
                                      )}
                                      {item.custom_attributes.pleat_density && (
                                        <div>📊 Pile Sıklığı: {item.custom_attributes.pleat_density}</div>
                                      )}
                                      {item.custom_attributes.mounting_type && (
                                        <div>🔧 {item.custom_attributes.mounting_type === 'cornice' ? 'Korniş' : 'Rustik'}</div>
                                      )}
                                      {item.custom_fabric_used_meters && (
                                        <div style={{ fontWeight: 600, color: '#7c3aed' }}>🧶 {item.custom_fabric_used_meters}m</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className={classes.productQty}>
                              {t('quantity')}: {item.quantity || 1}
                            </div>
                            <div className={classes.productPrice}>
                              {formatPrice(item.price, selectedOrder.original_currency)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {selectedOrder.delivery_address && (
                      <div className={classes.detailSection}>
                        <h3><FaMapMarkerAlt /> {t('deliveryAddress')}</h3>
                        <div className={classes.addressBox}>
                          {selectedOrder.delivery_address_title && (
                            <strong>{selectedOrder.delivery_address_title}</strong>
                          )}
                          <p>{selectedOrder.delivery_address}</p>
                          <p>
                            {selectedOrder.delivery_city}
                            {selectedOrder.delivery_country && `, ${selectedOrder.delivery_country}`}
                          </p>
                          {selectedOrder.delivery_phone && <p>{selectedOrder.delivery_phone}</p>}
                        </div>
                      </div>
                    )}

                    {/* Payment */}
                    <div className={classes.detailSection}>
                      <h3><FaCreditCard /> {t('paymentInfo')}</h3>
                      <div className={classes.paymentBox}>
                        {selectedOrder.card_type && selectedOrder.card_last_four && (
                          <p>{selectedOrder.card_type} **** {selectedOrder.card_last_four}</p>
                        )}
                        <p className={classes.totalPrice}>
                          <strong>{t('total')}:</strong> {formatPrice(selectedOrder.total_value, selectedOrder.original_currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className={classes.reviewsSection}>
              <div className={classes.card}>
                <div className={classes.cardTitle}>
                  <FaStar className={classes.titleIcon} />
                  <h3>{locale === 'tr' ? 'Değerlendirmelerim' : locale === 'ru' ? 'Мои отзывы' : locale === 'pl' ? 'Moje Opinie' : 'My Reviews'}</h3>
                </div>
                <div className={classes.cardContent}>
                  <ReviewsTabContent
                    userId={(session?.user as any)?.id}
                    locale={locale}
                    onShowToast={showToast}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Settings Placeholder */}

        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`${classes.toast} ${classes[toast.type]}`}>
            <div className={classes.toastIcon}>
              {toast.type === 'success' ? <FaCheck /> : <FaTimes />}
            </div>
            <span className={classes.toastText}>{toast.text}</span>
          </div>
        )}
      </div>
    </div >

  );
}
