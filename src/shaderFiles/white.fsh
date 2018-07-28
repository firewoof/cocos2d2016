
varying vec4 v_fragmentColor;
varying vec2 v_texCoord;
void main()
{
    vec4 tempColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);
    gl_FragColor = vec4(tempColor.a, tempColor.a, tempColor.a, tempColor.a);
    
}