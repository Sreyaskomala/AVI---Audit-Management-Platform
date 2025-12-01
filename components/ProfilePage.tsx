
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { User } from '../types';
import { UsersIcon } from './icons/UsersIcon';

const ProfilePage: React.FC = () => {
    const { currentUser, updateCurrentUserDetails } = useAppContext