package de.bbgs.named_colors;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name = "named-colors-model")
@XmlType(name = "NamedColorsModel")
public class NamedColorsModel implements IJAXBObject
{
    @XmlElement(name = "color")
    @XmlElementWrapper(name = "colors")
    public Collection<NamedColor> colors = new ArrayList<NamedColor>();

}
