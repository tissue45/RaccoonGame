import React, { useState, useEffect } from 'react'

interface User {
    id: string
    name: string
    email: string
    phone: string
    address: string
    password?: string
}

interface UserInfoModalProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
    onUserUpdate: (updatedUser: User) => void
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose, user, onUserUpdate }) => {
    const [editUserInfo, setEditUserInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    })
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        if (user) {
            setEditUserInfo({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            })
        }
    }, [user])

    const handleUserInfoChange = (field: string, value: string) => {
        setEditUserInfo(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleUserInfoSubmit = () => {
        // 유효성 검사
        if (!editUserInfo.name.trim()) {
            alert('이름을 입력해주세요.')
            return
        }
        if (!editUserInfo.email.trim()) {
            alert('이메일을 입력해주세요.')
            return
        }
        if (!editUserInfo.phone.trim()) {
            alert('전화번호를 입력해주세요.')
            return
        }

        if (!user) return

        // currentUser 업데이트
        const updatedUser: User = {
            ...user,
            name: editUserInfo.name,
            email: editUserInfo.email,
            phone: editUserInfo.phone,
            address: editUserInfo.address
        }
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))

        // users 배열에서도 해당 사용자 정보 업데이트
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
        const updatedUsers = existingUsers.map((existingUser: any) => {
            if (existingUser.id === user?.id) {
                return {
                    ...existingUser,
                    name: editUserInfo.name,
                    email: editUserInfo.email,
                    phone: editUserInfo.phone,
                    address: editUserInfo.address
                }
            }
            return existingUser
        })
        localStorage.setItem('users', JSON.stringify(updatedUsers))

        // 상태 업데이트
        onUserUpdate(updatedUser)
        
        alert('회원정보가 성공적으로 변경되었습니다.')
        onClose()
    }

    const handleChangePassword = () => {
        // 현재 비밀번호 확인
        if (currentPassword !== user?.password) {
            alert('현재 비밀번호가 올바르지 않습니다.')
            return
        }

        // 새 비밀번호 유효성 검사
        if (newPassword.length < 8) {
            alert('새 비밀번호는 8자 이상이어야 합니다.')
            return
        }

        if (newPassword !== confirmPassword) {
            alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
            return
        }

        // 로컬스토리지에서 사용자 정보 업데이트
        const currentUser = localStorage.getItem('currentUser')
        if (currentUser) {
            const userData = JSON.parse(currentUser)
            const updatedUser = {
                ...userData,
                password: newPassword
            }
            
            // currentUser 업데이트
            localStorage.setItem('currentUser', JSON.stringify(updatedUser))
            
            // users 배열에서도 해당 사용자의 비밀번호 업데이트
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
            const updatedUsers = existingUsers.map((existingUser: any) => {
                if (existingUser.email === userData.email) {
                    return {
                        ...existingUser,
                        password: newPassword
                    }
                }
                return existingUser
            })
            localStorage.setItem('users', JSON.stringify(updatedUsers))
            
            // 상태 업데이트
            onUserUpdate(updatedUser)
            
            alert('비밀번호가 성공적으로 변경되었습니다.')
            setShowChangePasswordModal(false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        }
    }

    const handleChangePasswordModalClose = () => {
        setShowChangePasswordModal(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
    }

    const handleModalClose = () => {
        onClose()
        // 원래 정보로 되돌리기
        if (user) {
            setEditUserInfo({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: user?.address || ''
            })
        }
    }

    if (!isOpen || !user) return null

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
                    <div className="flex justify-between items-center p-5 border-b border-gray-200">
                        <h3 className="m-0 text-lg font-semibold text-gray-800">회원정보 변경</h3>
                        <button 
                            className="bg-transparent border-none text-2xl text-gray-400 cursor-pointer p-0 w-8 h-8 flex items-center justify-center hover:text-gray-800"
                            onClick={handleModalClose}
                        >
                            ×
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block mb-2 font-semibold text-gray-800">이름 *</label>
                                <input
                                    type="text"
                                    value={editUserInfo.name}
                                    onChange={(e) => handleUserInfoChange('name', e.target.value)}
                                    placeholder="이름을 입력하세요"
                                    className="w-full py-3 px-4 border border-gray-300 rounded focus:outline-none focus:border-gray-800 text-base box-border"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold text-gray-800">이메일 *</label>
                                <input
                                    type="email"
                                    value={editUserInfo.email}
                                    onChange={(e) => handleUserInfoChange('email', e.target.value)}
                                    placeholder="이메일을 입력하세요"
                                    className="w-full py-3 px-4 border border-gray-300 rounded focus:outline-none focus:border-gray-800 text-base box-border"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold text-gray-800">전화번호 *</label>
                                <input
                                    type="tel"
                                    value={editUserInfo.phone}
                                    onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                                    placeholder="전화번호를 입력하세요"
                                    className="w-full py-3 px-4 border border-gray-300 rounded focus:outline-none focus:border-gray-800 text-base box-border"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold text-gray-800">주소</label>
                                <input
                                    type="text"
                                    value={editUserInfo.address}
                                    onChange={(e) => handleUserInfoChange('address', e.target.value)}
                                    placeholder="주소를 입력하세요"
                                    className="w-full py-3 px-4 border border-gray-300 rounded focus:outline-none focus:border-gray-800 text-base box-border"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">비밀번호 변경</h4>
                            <p className="text-sm text-gray-600 mb-3">비밀번호를 변경하시려면 아래 버튼을 클릭하세요.</p>
                            <button 
                                className="bg-gray-800 text-white py-2 px-4 rounded text-sm hover:bg-gray-600 transition-colors"
                                onClick={() => setShowChangePasswordModal(true)}
                            >
                                비밀번호 변경
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2.5 p-5 border-t border-gray-200 justify-end">
                        <button 
                            className="py-3 px-6 border-none rounded text-sm cursor-pointer transition-colors duration-300 bg-gray-50 text-gray-600 hover:bg-gray-200"
                            onClick={handleModalClose}
                        >
                            취소
                        </button>
                        <button 
                            className="py-3 px-6 border-none rounded text-sm cursor-pointer transition-colors duration-300 bg-gray-800 text-white hover:bg-gray-600"
                            onClick={handleUserInfoSubmit}
                        >
                            변경
                        </button>
                    </div>
                </div>
            </div>

            {/* 비밀번호 변경 모달 */}
            {showChangePasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <h3 className="m-0 text-lg font-semibold text-gray-800">비밀번호 변경</h3>
                            <button 
                                className="bg-transparent border-none text-2xl text-gray-400 cursor-pointer p-0 w-8 h-8 flex items-center justify-center hover:text-gray-800"
                                onClick={handleChangePasswordModalClose}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold text-gray-800">현재 비밀번호</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="현재 비밀번호를 입력하세요"
                                    className="w-full py-3 px-4 border border-gray-300 rounded focus:outline-none focus:border-gray-800 text-base box-border"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold text-gray-800">새 비밀번호</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="새 비밀번호를 입력하세요"
                                    className="w-full py-3 px-4 border border-gray-300 rounded focus:outline-none focus:border-gray-800 text-base box-border"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold text-gray-800">새 비밀번호 확인</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="새 비밀번호를 다시 입력하세요"
                                    className="w-full py-3 px-4 border border-gray-300 rounded focus:outline-none focus:border-gray-800 text-base box-border"
                                />
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed m-0 mb-4">
                                * 비밀번호는 8자 이상이어야 합니다.
                            </p>
                        </div>
                        <div className="flex gap-2.5 p-5 border-t border-gray-200 justify-end">
                            <button 
                                className="py-3 px-6 border-none rounded text-sm cursor-pointer transition-colors duration-300 bg-gray-50 text-gray-600 hover:bg-gray-200"
                                onClick={handleChangePasswordModalClose}
                            >
                                취소
                            </button>
                            <button 
                                className="py-3 px-6 border-none rounded text-sm cursor-pointer transition-colors duration-300 bg-gray-800 text-white hover:bg-gray-600"
                                onClick={handleChangePassword}
                            >
                                변경
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default UserInfoModal
