import { writable } from 'svelte/store'
import { browser } from '$app/environment'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export const deviceType = writable<DeviceType>('desktop')

export function initDeviceDetection() {
	if (!browser) return

	const checkDevice = () => {
		const width = window.innerWidth
		
		// 📍 DODAJ TEGO CONSOLE.LOG
		console.log('📱 Wykryto szerokość ekranu:', width + 'px')
		
		if (width < 768) {
			console.log('📱 URZĄDZENIE: MOBILNE (telefon)')
			deviceType.set('mobile')
		} else if (width < 1024) {
			console.log('📱 URZĄDZENIE: TABLET')
			deviceType.set('tablet')
		} else {
			console.log('💻 URZĄDZENIE: DESKTOP (komputer)')
			deviceType.set('desktop')
		}
	}

	checkDevice()
	window.addEventListener('resize', checkDevice)
	return () => window.removeEventListener('resize', checkDevice)
}