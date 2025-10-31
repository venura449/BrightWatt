import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type FilterItem = {
  label: string;
  value: string;
};

type FilterDropdownProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: FilterItem[];
  placeholder?: string;
  containerStyle?: object;
  iconSize?: number;
  iconColor?: string;
};

// Helper function to get short form of filter labels
const getFilterAbbreviation = (label: string): string => {
  switch (label.toLowerCase()) {
    case 'beginner':
      return 'Beg';
    case 'intermediate':
      return 'Int';
    case 'advanced':
      return 'Adv';
    case 'all':
      return 'None';
    default:
      return label.length > 3 ? label.substring(0, 3).toUpperCase() : label.toUpperCase();
  }
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  onValueChange,
  items,
  placeholder = 'Filter',
  containerStyle = {},
  iconSize = 20,
  iconColor = '#007AFF',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const selectedItem = items.find(item => item.value === value);

  const openModal = () => setIsVisible(true);
  const closeModal = () => setIsVisible(false);

  const handleSelect = (itemValue: string) => {
    onValueChange(itemValue);
    closeModal();
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.filterContainer, containerStyle]} 
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Text style={styles.filterText}>Filter</Text>
        <View style={styles.iconContainer}>
          <FontAwesome name="filter" size={iconSize} color={iconColor} />
        </View>
        {selectedItem && selectedItem.value !== '' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {getFilterAbbreviation(selectedItem.label)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeModal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={item.value || index}
                  style={[
                    styles.optionItem,
                    value === item.value && styles.optionItemSelected
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={[
                    styles.optionText,
                    value === item.value && styles.optionTextSelected
                  ]}>
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
    
    // Modern shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: width * 0.85,
    maxHeight: '70%',
    
    // Modern shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  optionItemSelected: {
    backgroundColor: '#f8f9ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default FilterDropdown;
