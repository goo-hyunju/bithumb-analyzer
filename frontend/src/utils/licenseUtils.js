/**
 * 라이선스 관련 유틸리티
 */

const LICENSE_STORAGE_KEY = 'capas_license';

/**
 * 라이선스 키 형식 검증
 * 형식: CAPAS-XXXX-XXXX-XXXX (대문자)
 */
export const validateLicenseFormat = (key) => {
  if (!key || typeof key !== 'string') return false;
  
  const formatted = key.trim().toUpperCase();
  const pattern = /^CAPAS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  
  return pattern.test(formatted);
};

/**
 * 라이선스 데이터 저장
 */
export const saveLicense = (licenseData) => {
  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(licenseData));
  } catch (err) {
    console.error('라이선스 저장 실패:', err);
  }
};

/**
 * 라이선스 데이터 불러오기
 */
export const loadLicense = () => {
  try {
    const data = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('라이선스 불러오기 실패:', err);
  }
  return null;
};

/**
 * 라이선스 활성화 여부 확인
 */
export const isLicenseActive = () => {
  const license = loadLicense();
  return license && license.isActive === true;
};

/**
 * 라이선스 삭제 (비활성화)
 */
export const clearLicense = () => {
  try {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
  } catch (err) {
    console.error('라이선스 삭제 실패:', err);
  }
};

/**
 * 라이선스 만료 확인
 */
export const isLicenseExpired = () => {
  const license = loadLicense();
  if (!license || !license.expiresAt) return false;
  
  const expiresAt = new Date(license.expiresAt);
  const now = new Date();
  
  return now > expiresAt;
};

