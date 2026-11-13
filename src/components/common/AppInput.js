import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../theme';

const AppInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  icon,
  label,
  error,
  multiline = false,
  ...rest
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineWrapper,
          error ? styles.inputError : null,
        ]}
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}

        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            multiline && styles.multilineInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...rest}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.md,
  },
  label: {
    fontSize: SIZES.caption,
    color: COLORS.textPrimary,
    ...FONTS.semiBold,
    marginBottom: SIZES.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.radiusMd,
    height: SIZES.inputHeight,
    paddingHorizontal: SIZES.md,
  },
  multilineWrapper: {
    height: undefined,
    minHeight: SIZES.inputHeight * 2,
    alignItems: 'flex-start',
    paddingVertical: SIZES.sm,
  },
  inputError: {
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  icon: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.textDark,
    ...FONTS.regular,
    height: '100%',
    padding: 0,
  },
  inputWithIcon: {
    // placeholder — icon margin handles spacing
  },
  multilineInput: {
    height: undefined,
    minHeight: SIZES.inputHeight * 1.5,
  },
  errorText: {
    fontSize: SIZES.small,
    color: COLORS.danger,
    ...FONTS.regular,
    marginTop: SIZES.xs,
  },
});

export default AppInput;
