'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import classes from './page.module.css';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaSave, FaEdit, FaLock, FaTimes, FaCheck, FaUserCircle } from 'react-icons/fa';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ name: string }>>([]);
  const [selectedCountry, setSelectedCountry] = useState('Turkey');
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // Active tab for sidebar navigation
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'wishlist' | 'settings'>('profile');

  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
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

          // Load addresses if available
          if (data.addresses && Array.isArray(data.addresses)) {
            setAddresses(data.addresses);
          }
        } else {
          // Fallback to session data
          setFormData({
            name: session.user.name || '',
            email: session.user.email || '',
            phone: '',
            birthdate: '',
          });
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

      console.log('Saving address:', addressData);

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
    setLoading(true);
    setMessage(null);

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
        throw new Error(errorData.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('error', t('passwordError'));
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
              onClick={() => setActiveTab('profile')}
            >
              <FaUser className={classes.menuIcon} />
              <span>{t('myProfile')}</span>
            </button>
            <button
              className={`${classes.menuItem} ${activeTab === 'addresses' ? classes.active : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <FaMapMarkerAlt className={classes.menuIcon} />
              <span>{t('myAddresses')}</span>
            </button>
            <button
              className={`${classes.menuItem} ${activeTab === 'orders' ? classes.active : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <FaEnvelope className={classes.menuIcon} />
              <span>{t('orders')}</span>
            </button>
            <button
              className={`${classes.menuItem} ${activeTab === 'settings' ? classes.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaLock className={classes.menuIcon} />
              <span>{t('settings')}</span>
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

          {/* Orders Placeholder */}
          {activeTab === 'orders' && (
            <div className={`${classes.card} ${classes.fullWidthCard}`}>
              <div className={classes.cardTitle}>
                <FaEnvelope className={classes.titleIcon} />
                <h3>{t('orders')}</h3>
              </div>
              <div className={classes.cardContent}>
                <p className={classes.noAddresses}>{t('noOrders') || 'No orders found.'}</p>
              </div>
            </div>
          )}

          {/* Settings Placeholder */}
          {activeTab === 'settings' && (
            <div className={`${classes.card} ${classes.fullWidthCard}`}>
              <div className={classes.cardTitle}>
                <FaLock className={classes.titleIcon} />
                <h3>{t('settings')}</h3>
              </div>
              <div className={classes.cardContent}>
                <p className={classes.noAddresses}>{t('settingsPlaceholder') || 'Settings coming soon.'}</p>
              </div>
            </div>
          )}
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
    </div>

  );
}
