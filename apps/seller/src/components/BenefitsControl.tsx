"use client";
import React, { useState } from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

interface BenefitsControlProps {
  benefits?: string[];
  onBlur:
    | React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
    | undefined;
  onChange: (values: string[]) => void;
  disabled?: boolean | undefined;
  error?: boolean | undefined;
  helperText?: React.ReactNode;
}

function BenefitsControl({
  benefits,
  onBlur,
  onChange,
  disabled,
  error,
  helperText,
}: BenefitsControlProps) {
  const [benefitText, setBenefitText] = useState("");

  const addBenefit = () => {
    if (benefitText.trim().length === 0) {
      return;
    }
    // Make sure the benefit doesn't already exist
    if (!benefits?.includes(benefitText)) {
      onChange([...(benefits ?? []), benefitText]);
    }
    setBenefitText("");
  };

  const removeBenefit = (benefit: string) => {
    onChange(benefits?.filter((b) => b !== benefit) ?? []);
  };

  return (
    <>
      <TextField
        size="small"
        label="Add a benefit"
        name="benefits"
        id="benefits"
        onBlur={onBlur}
        onChange={(e) => setBenefitText(e.target.value)}
        value={benefitText}
        disabled={disabled}
        error={error}
        helperText={helperText}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Add benefit"
                onClick={addBenefit}
                edge="end"
              >
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {benefits && benefits?.length > 0 && (
        <FormControl
          size="small"
          variant="standard"
          disabled={disabled}
          error={error}
        >
          <FormLabel>Benefits</FormLabel>
          <FormGroup>
            {benefits.map((benefit) => (
              <FormControlLabel
                key={benefit}
                control={
                  <Checkbox
                    checked
                    onChange={() => removeBenefit(benefit)}
                    name={benefit}
                    checkedIcon={<CloseIcon />}
                  />
                }
                label={benefit}
              />
            ))}
          </FormGroup>
        </FormControl>
      )}
    </>
  );
}

export default BenefitsControl;
